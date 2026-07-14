import { useIntervalFn } from "@vueuse/core";
import { scan } from "qr-scanner-wechat";
import type { BaseIssue, BaseSchema, InferInput } from "valibot";
import { onBeforeUnmount, type Ref, ref } from "vue";

import { parseQrCodeRawText, type UseQrScannerOptions } from "@/utils";

import { useLazyFreeCameraStream } from "./lazy-free-camera-stream";

export interface UseCameraQrScannerOptions<TData> extends UseQrScannerOptions<TData> {
  /** 两次扫描之间的间隔(毫秒)
   * @default 120 */
  scanInterval?: number;
}

/** 摄像头扫码Composable的状态
 * @enum off 关闭，所有媒体资源均被释放
 * @enum starting 启动中，正在准备媒体资源，尚未开始扫描
 * @enum active 激活，占用媒体资源，定时扫描视频帧
 * @enum idle 悬置，占用媒体资源，但不做任何处理 */
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
  const { scanInterval = 120, onSuccess = (_) => undefined, onError = (_) => undefined } = options;

  /** 摄像头扫码Composable的状态 */
  const status = ref<UseCameraQrScannerStatus>("off");

  /** 用于扫描二维码的Canvas */
  let canvas: HTMLCanvasElement | null = null;
  /** 用于扫描二维码的Canvas 2D上下文 */
  let canvasCtx: CanvasRenderingContext2D | null = null;

  /** 最近一次识别到的扫描结果原始文本
   * 扫描不到二维码时，qr-scanner-wechat的scan实际会返回undefined（与类型推断不符），undefined不可去除 */
  let lastScannedRawText: string | null | undefined = null;

  /** 处理扫码成功 */
  const handleSuccess = (qrCodeData: InferInput<TSchema>) => {
    onSuccess(qrCodeData);
  };

  /** 处理错误 */
  const handleError = (err: unknown) => {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    onError(err as Error);
  };

  // 惰性关闭的摄像头流
  const {
    cameraStream,
    isCameraSupported,
    disableStreamTracks,
    enableStreamTracks,
    requestCameraStream,
    releaseCameraStream
  } = useLazyFreeCameraStream();

  /** 从激活状态切换到悬置状态，不会断开摄像头，仍然占用资源消耗性能 */
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

  /** 处理扫描结果原始文本 */
  const handleScanRawText = (rawText: string | null | undefined) => {
    // 空内容或重复识别，不处理
    if (!rawText || rawText === lastScannedRawText) return;
    lastScannedRawText = rawText;

    // 解析原始文本
    const qrCodeData = parseQrCodeRawText(rawText, schema);

    // 解析成功
    try {
      handleSuccess(qrCodeData);
    } finally {
      stop();
    }
  };

  /** 是否正在尝试从视频帧中扫描二维码 */
  const isScanFramePending = ref(false);
  /** 尝试扫描当前视频帧中的二维码 */
  const scanVideoFrame = async () => {
    // 上次扫描未结束
    if (isScanFramePending.value) return;
    // 摄像头扫码Composable未启动
    if (status.value !== "active") return;
    const video = videoRef.value;
    // 视频元素尚不可用
    if (!video || video.readyState < 2) return;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    if (!videoWidth || !videoHeight) return;

    try {
      // 初始化Canvas
      if (!canvas || !canvasCtx) {
        canvas = document.createElement("canvas");
        canvasCtx = canvas.getContext("2d", { willReadFrequently: true });
      }
      if (!canvasCtx) throw new Error("设备或浏览器\n不支持扫码\n请拍照上传");
      // 设置Canvas画布尺寸与视频一致
      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }
    } catch (err) {
      stop();
      throw err;
    }

    // 扫描当前视频帧
    try {
      isScanFramePending.value = true;
      // 从绘制当前视频帧到Canvas
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // 尝试扫描二维码
      const result = await scan(canvas);
      // 处理扫描结果原始文本
      handleScanRawText(result.text);
    } finally {
      isScanFramePending.value = false;
    }
  };

  // 定时扫描视频帧
  const { pause: pauseScanInterval, resume: resumeScanInterval } = useIntervalFn(
    async () => {
      try {
        await scanVideoFrame();
      } catch (err) {
        handleError(err);
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
        throw new Error("地址不安全\n请使用HTTPS\n或拍照上传");
      }
      // 不支持摄像头媒体
      if (!isCameraSupported.value) {
        throw new Error("设备或浏览器\n不支持扫码\n请拍照上传");
      }
      lastScannedRawText = null;

      const video = videoRef.value;
      if (!video) throw new Error("页面加载失败\n请刷新重试");

      status.value = "starting";

      // 请求摄像头流
      await requestCameraStream();
      if (!cameraStream.value) throw new Error("连接摄像头\n失败");
      // 关联视频流
      video.srcObject = cameraStream.value;
      await video.play();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (status.value !== "starting") throw new Error("状态异常\n扫码启动失败");
      status.value = "active";
      // 开始定时扫描视频帧
      resumeScanInterval();
    } catch (err) {
      if (status.value !== "off") {
        stop();
      }
      const humanizedMsg = (() => {
        if (!(err instanceof Error)) return "未知错误";
        switch (err.name) {
          case "NotReadableError":
            return "无法播放\n摄像头画面";
          case "NotAllowedError":
          case "PermissionDeniedError":
            return "获取摄像头\n权限失败\n请检查设置";
          case "NotFoundError":
          case "DevicesNotFoundError":
            return "未找到\n可用摄像头";
          case "TrackStartError":
            return "摄像头被占用";
          default:
            console.error(err);
            return err.message || "扫码启动失败";
        }
      })();
      handleError(new Error(humanizedMsg, { cause: err }));
    }
  };

  /** 停止扫码并释放资源 */
  const stop = () => {
    // 停止扫描视频帧
    pauseScanInterval();
    // 释放摄像头流
    releaseCameraStream();
    // 释放视频元素关联的资源
    const video = videoRef.value;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    // 清理Canvas
    canvas = null;
    canvasCtx = null;

    // 重置状态
    lastScannedRawText = null;
    isScanFramePending.value = false;
    status.value = "off";
  };

  // 组件卸载前停止扫码并释放资源
  onBeforeUnmount(() => {
    stop();
  });

  return {
    start,
    stop,
    status,
    switchToIdle,
    switchToActive
  };
};
