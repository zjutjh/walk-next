import { useFileDialog, useUserMedia } from "@vueuse/core";
import { QR_CODE_TYPE, type QrCodeType } from "api/types/admin";
import { ready, scan } from "qr-scanner-wechat";
import { onBeforeUnmount, type Ref, ref } from "vue";

export interface QrCodeData {
  code_type: QrCodeType;
  /** 团队码content就是team_id, 签到码就是对应的key(随机字符串) */
  content: string;
}

/** 摄像头朝向, environment是后置, user是前置(无法使用双摄像头设备测试所以我也不清楚到底什么作用) */
export const CAMERA_FACING_MODE = {
  Environment: "environment",
  User: "user"
} as const;
export type CameraFacingMode = (typeof CAMERA_FACING_MODE)[keyof typeof CAMERA_FACING_MODE];

export interface UseQrScannerWechatOptions {
  /** 扫描频率，单位毫秒。默认 120，表示每 120ms 抓一帧去识别 */
  scanInterval?: number;
  facingMode?: CameraFacingMode;
}

type QrParseResult = { ok: true; qrCodeData: QrCodeData } | { ok: false; error: string };

const QR_SCAN_ERROR_MESSAGE = {
  InvalidQr: "二维码错误：内容格式不正确",
  NoQr: "二维码错误：未识别到二维码",
  ScanFailed: "二维码错误：识别失败",
  ScannerLoadFailed: "二维码错误：识别库加载失败",
  CameraUnsupported: "摄像头错误：当前浏览器不支持摄像头扫码，可改用上传图片",
  CameraInsecureContext:
    "摄像头错误：当前地址不支持摄像头，请使用 HTTPS 或 localhost，也可上传图片",
  CameraDenied: "摄像头错误：权限被拒绝，可在浏览器设置中允许摄像头或改用上传图片",
  CameraNotFound: "摄像头错误：未找到可用摄像头，可改用上传图片",
  CameraBusy: "摄像头错误：摄像头被占用，可关闭其他应用后重试或改用上传图片",
  CameraPermission: "摄像头错误：无法获取摄像头，可改用上传图片",
  ImageLoad: "图片错误：图片加载失败",
  ImageScanFailed: "图片错误：识别失败"
} as const;

const getCameraErrorMessage = (error: unknown) => {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return QR_SCAN_ERROR_MESSAGE.CameraInsecureContext;
  }

  const errorName = error instanceof Error ? error.name : "";

  switch (errorName) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return QR_SCAN_ERROR_MESSAGE.CameraDenied;
    case "NotFoundError":
    case "DevicesNotFoundError":
      return QR_SCAN_ERROR_MESSAGE.CameraNotFound;
    case "NotReadableError":
    case "TrackStartError":
      return QR_SCAN_ERROR_MESSAGE.CameraBusy;
    default:
      return QR_SCAN_ERROR_MESSAGE.CameraPermission;
  }
};

/** 解析二维码文本为业务数据 */
const parseQrPayload = (rawText: string): QrParseResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: QR_SCAN_ERROR_MESSAGE.InvalidQr };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: QR_SCAN_ERROR_MESSAGE.InvalidQr };
  }

  /** 二维码解析出来的 JSON 对象 */
  const record = parsed as Record<string, unknown>;
  const codeType = record.code_type;
  const content = record.content;

  if (codeType !== QR_CODE_TYPE.Team && codeType !== QR_CODE_TYPE.Checkin) {
    return { ok: false, error: QR_SCAN_ERROR_MESSAGE.InvalidQr };
  }

  if (typeof content !== "string" || content.length === 0) {
    return { ok: false, error: QR_SCAN_ERROR_MESSAGE.InvalidQr };
  }

  // eslint-disable-next-line camelcase
  return { ok: true, qrCodeData: { code_type: codeType, content } };
};

/** 此composable本体函数,  @see {videoRef} 传入一个绑定了<video>元素的ref，用于在前端页面里展示摄像头结果 */
export const useQrScanner = (
  videoRef: Ref<HTMLVideoElement | undefined>,
  options: UseQrScannerWechatOptions = {}
) => {
  const { scanInterval = 120, facingMode = CAMERA_FACING_MODE.Environment } = options;
  const cameraConstraints: MediaStreamConstraints = {
    audio: false,
    video: { facingMode: { ideal: facingMode } }
  };

  const {
    isSupported: isCameraSupported,
    start: startCameraStream,
    stop: stopCameraStream
  } = useUserMedia({
    constraints: cameraConstraints
  });

  const {
    open: openFileDialog,
    onChange: onFileChange,
    onCancel: onFileCancel,
    reset: resetFileDialog
  } = useFileDialog({
    accept: "image/*",
    multiple: false
  });

  /** 表示摄像头是否已激活 */
  const isActive = ref(false);
  const errorMessage = ref("");
  const scannedQrCodeData = ref<QrCodeData | null>(null);

  let intervalId: number | null = null;
  /** 最后一帧识别到的文字 */
  let lastDetectedRawText = "";

  let readyPromise: Promise<void> | null = null;

  /** @see {scanFrame} 使用的辅助变量 */
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let isScanning = false;

  const ensureScannerReady = async () => {
    if (!readyPromise) {
      readyPromise = ready();
    }

    try {
      await readyPromise;
    } catch (error) {
      readyPromise = null;
      throw error;
    }
  };

  const clearVideoElement = () => {
    const video = videoRef.value;
    if (!video) return;
    video.pause();
    video.srcObject = null;
  };

  /** 停止扫码并释放摄像头资源 */
  const stop = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    stopCameraStream();
    clearVideoElement();

    isActive.value = false;
    isScanning = false;
  };

  /** 统一处理识别到的元数据并写入状态 */
  const handleDetectedRawText = (rawText: string) => {
    if (!rawText || rawText === lastDetectedRawText) return;
    lastDetectedRawText = rawText;

    const parsed = parseQrPayload(rawText);
    if (parsed.ok) {
      errorMessage.value = "";
      scannedQrCodeData.value = parsed.qrCodeData;
      stop();
    } else {
      errorMessage.value = parsed.error;
      scannedQrCodeData.value = null;
    }
  };

  /** 从视频帧中识别二维码 */
  const scanFrame = async () => {
    if (isScanning || !isActive.value) return;
    const video = videoRef.value;
    if (!video || video.readyState < 2) return;

    if (!canvas) canvas = document.createElement("canvas");
    if (!ctx) ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    isScanning = true;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // 调用qr-scanner-wechat 扫码库识别canvas中的图像数据
      const result = await scan(canvas);
      if (!result.text) return;
      handleDetectedRawText(result.text);
    } catch {
      errorMessage.value = QR_SCAN_ERROR_MESSAGE.ScanFailed;
    } finally {
      isScanning = false;
    }
  };
  /** 开始扫码进程 */
  const start = async (): Promise<boolean> => {
    if (isActive.value) return true;
    errorMessage.value = "";
    scannedQrCodeData.value = null;
    lastDetectedRawText = "";

    if (typeof window !== "undefined" && !window.isSecureContext) {
      errorMessage.value = QR_SCAN_ERROR_MESSAGE.CameraInsecureContext;
      return false;
    }

    if (!isCameraSupported.value) {
      errorMessage.value = QR_SCAN_ERROR_MESSAGE.CameraUnsupported;
      return false;
    }

    try {
      await ensureScannerReady();
    } catch {
      errorMessage.value = QR_SCAN_ERROR_MESSAGE.ScannerLoadFailed;
      return false;
    }

    try {
      const stream = await startCameraStream();
      const video = videoRef.value;
      if (!stream || !video) {
        throw new Error("camera-stream-unavailable");
      }

      video.srcObject = stream;
      await video.play();
      isActive.value = true;
      intervalId = window.setInterval(scanFrame, scanInterval);
      return true;
    } catch (error) {
      errorMessage.value = getCameraErrorMessage(error);
      stop();
      return false;
    }
  };

  // 以下三个函数是用于支持手动上传图片来识别二维码
  const pickImageFile = () =>
    new Promise<File | null>((resolve) => {
      let stopListening: () => void = () => undefined;
      const changeHook = onFileChange((files) => {
        stopListening();
        const file = files?.[0] ?? null;
        resetFileDialog();
        resolve(file);
      });
      const cancelHook = onFileCancel(() => {
        stopListening();
        resolve(null);
      });

      stopListening = () => {
        changeHook.off();
        cancelHook.off();
      };

      openFileDialog();
    });

  const scanImageFile = async (file: File): Promise<boolean> => {
    errorMessage.value = "";

    const url = URL.createObjectURL(file);
    try {
      await ensureScannerReady();

      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("image-load-failed"));
      });
      const result = await scan(image);
      if (!result.text) {
        errorMessage.value = QR_SCAN_ERROR_MESSAGE.NoQr;
        return false;
      }
      handleDetectedRawText(result.text);
      return true;
    } catch (err) {
      errorMessage.value =
        err instanceof Error && err.message === "image-load-failed"
          ? QR_SCAN_ERROR_MESSAGE.ImageLoad
          : QR_SCAN_ERROR_MESSAGE.ImageScanFailed;
      return false;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const scanFromImage = async (): Promise<boolean> => {
    stop();
    const file = await pickImageFile();
    if (!file) return false;
    return scanImageFile(file);
  };

  onBeforeUnmount(() => {
    stop();
  });

  return {
    /** 传入的video元素是否已激活 */
    isActive,
    errorMessage,
    /** 扫描出的结构化数据(无论是摄像头扫码还是识别图片) */
    scannedQrCodeData,
    /** 开始扫码 */
    start,
    /** 选择图片并识别 */
    scanFromImage,
    /** 扫码结束 */
    stop
  };
};
