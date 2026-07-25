import { useLastChanged, useTimeoutPoll, watchImmediate } from "@vueuse/core";
import { scan } from "qr-scanner-wechat";
import { type BaseIssue, type BaseSchema, type InferInput, ValiError } from "valibot";
import { onBeforeUnmount, readonly, type Ref, ref } from "vue";

import { parseQrCodeRawText, type UseQrScannerOptions } from "@/utils";

import { useLazyFreeCameraStream } from "./lazy-free-camera-stream";

/** 两次扫描之间的间隔(毫秒)默认值 */
const DEFAULT_SCAN_INTERVAL = 200 as const;

/** 两次重复扫码之间的最短时长(毫秒) */
const DUPLICATE_SCAN_INTERVAL = 5000 as const;

export interface UseCameraQrScannerOptions<TData> extends UseQrScannerOptions<TData> {
  /** 两次扫描之间的间隔(毫秒)  */
  scanInterval?: number;
}

/** 摄像头扫码Composable的状态
 * @enum off 关闭，所有媒体资源均被释放
 * @enum starting 启动中，正在准备媒体资源，尚未开始扫描
 * @enum active 激活，占用媒体资源，定时扫描视频帧
 * @enum idle 悬置，占用媒体资源，但不输出画面也不扫描 */
export type UseCameraQrScannerStatus = "off" | "starting" | "active" | "idle";

/** 摄像头扫码 */
export const useCameraQrScanner = <
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
>(
  /** 绑定的<video>元素，用于摄像头显示 */
  videoRef: Ref<HTMLVideoElement | null>,
  options: UseCameraQrScannerOptions<InferInput<TSchema>> = {},
  schema: TSchema
) => {
  // 初始化参数
  const {
    scanInterval = DEFAULT_SCAN_INTERVAL,
    onSuccess: emitSuccess = (_) => undefined,
    onError: emitError = (_) => undefined
  } = options;

  /** 摄像头扫码Composable的状态 */
  const status = ref<UseCameraQrScannerStatus>("off");
  /** 视频元素能否播放摄像头画面 */
  const isCameraVideoPlayable = ref(false);

  /** 用于扫描二维码的Canvas */
  let canvas: HTMLCanvasElement | null = null;
  /** 用于扫描二维码的Canvas 2D上下文 */
  let canvasCtx: CanvasRenderingContext2D | null = null;

  /** 最近一次识别到的扫描结果原始文本
   * 扫描不到二维码时，qr-scanner-wechat的scan实际会返回undefined（与类型推断不符），undefined不可去除 */
  const lastScannedRawText = ref<string | null | undefined>(null);
  /** lastScannedRawText最近一次改变的时间戳 */
  const lastScannedRawTextChangedAt = useLastChanged(lastScannedRawText);

  // 惰性关闭的摄像头流
  const {
    cameraStream,
    isCameraSupported,
    disableStreamTracks,
    enableStreamTracks,
    requestCameraStream,
    releaseCameraStream,
    restartCameraStream
  } = useLazyFreeCameraStream();

  // 释放视频元素相关资源，重置状态
  const releaseVideoResources = () => {
    const video = videoRef.value;
    if (!video) return;
    isCameraVideoPlayable.value = false;
    video.pause();
    video.srcObject = null;
  };

  // 绑定摄像头流
  watchImmediate([cameraStream, status, videoRef], async ([cameraStreamVal, statusVal, video]) => {
    try {
      if (!video) return;

      // 摄像头流未改变，忽略
      if (video.srcObject === cameraStreamVal) return;
      // 处于关闭状态，中止
      if (statusVal === "off") return;

      // 摄像头流为空
      if (!cameraStreamVal) {
        releaseVideoResources();
        return;
      }

      // 关联视频流
      video.srcObject = cameraStreamVal;
      // 播放视频流
      await video.play();
      // @ts-expect-error: 2367
      if (statusVal === "off") return;
      isCameraVideoPlayable.value = true;
    } catch (err) {
      // play完成前被pause中断，静默忽略
      if (err instanceof DOMException && err.name === "AbortError") {
        return console.warn(err);
      }

      emitError(err, { blocking: true });
    }
  });

  /** 从激活状态切换到悬置状态（不会断开摄像头，仍然占用资源 消耗性能） */
  const switchToIdle = () => {
    if (status.value !== "active") return;
    // 暂停定时扫描视频帧
    pauseScanInterval();
    // 禁用摄像头流输出
    disableStreamTracks();
    status.value = "idle";
  };

  /** 从悬置状态切换到激活状态 */
  const switchToActive = () => {
    if (status.value !== "idle") return;
    // 启用摄像头流输出
    enableStreamTracks();
    // 恢复定时扫描视频帧
    resumeScanInterval();
    status.value = "active";
  };

  /** 尝试扫描当前视频帧中的二维码 */
  const scanVideoFrame = async () => {
    // 摄像头扫码Composable不在激活状态
    if (status.value !== "active") return;

    const video = videoRef.value;

    try {
      // 视频元素尚不可用
      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      if (!videoWidth || !videoHeight) return;

      // 摄像头流异常失效，重启摄像头流
      if (!cameraStream.value?.active) {
        pauseScanInterval();
        await restartCameraStream();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (status.value !== "active") return;
        resumeScanInterval();
        return;
      }

      // 初始化Canvas
      if (!canvas || !canvasCtx) {
        canvas = document.createElement("canvas");
        canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!canvasCtx) throw new Error("设备或浏览器不支持扫码，请拍照上传");
      // 设置Canvas画布尺寸与视频一致
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
    } catch (err) {
      stop();

      return emitError(err, { blocking: true });
    }

    // 从绘制当前视频帧到Canvas
    canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 尝试扫描二维码
    const result = await scan(canvas);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (status.value !== "active") return;

    // 未识别到二维码，忽略
    if (!result.text) return;

    // 短时间内重复识别，忽略
    if (
      result.text === lastScannedRawText.value &&
      Date.now() - (lastScannedRawTextChangedAt.value ?? 0) < DUPLICATE_SCAN_INTERVAL
    ) {
      return;
    }
    lastScannedRawText.value = result.text;

    // 处理扫描结果原始文本
    const parseResult = parseQrCodeRawText(result.text, schema);
    if (parseResult.success) {
      emitSuccess(parseResult.output);
    } else {
      emitError(new ValiError(parseResult.issues));
    }
  };

  // 定时扫描视频帧
  const { pause: pauseScanInterval, resume: resumeScanInterval } = useTimeoutPoll(
    async () => {
      try {
        await scanVideoFrame();
      } catch (err) {
        emitError(err);
      }
    },
    scanInterval,
    { immediate: false, immediateCallback: true }
  );

  /** 开始扫码 */
  const start = async () => {
    try {
      if (status.value !== "off") return;

      // 非安全上下文，不支持调用摄像头
      if (typeof window !== "undefined" && !window.isSecureContext) {
        throw new Error("地址不安全，请联系技术人员");
      }
      // 不支持摄像头媒体
      if (!isCameraSupported.value) {
        throw new Error("设备或浏览器不支持扫码，请拍照上传");
      }

      // 重置状态，进入启动中状态
      lastScannedRawText.value = null;
      status.value = "starting";

      // 请求摄像头流
      await requestCameraStream();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (status.value !== "starting") throw new Error("状态异常，扫码启动失败");
      if (!cameraStream.value) throw new Error("连接摄像头失败，请刷新重试");

      // 进入激活状态
      status.value = "active";
      // 开始定时扫描视频帧
      resumeScanInterval();
    } catch (err) {
      if (status.value !== "off") {
        stop();
      }

      emitError(err, { blocking: true });
    }
  };

  /** 停止扫码并释放资源 */
  const stop = () => {
    // 停止扫描视频帧
    pauseScanInterval();
    // 释放摄像头流
    releaseCameraStream();
    // 释放视频元素关联的资源
    releaseVideoResources();
    // 清理Canvas
    canvas = null;
    canvasCtx = null;

    // 重置状态
    lastScannedRawText.value = null;
    status.value = "off";
  };

  // 组件卸载前停止扫码并释放资源
  onBeforeUnmount(() => {
    stop();
  });

  return {
    start,
    stop,
    status: readonly(status),
    isCameraVideoPlayable: readonly(isCameraVideoPlayable),
    switchToIdle,
    switchToActive
  };
};
