import { useTimeoutFn, useUserMedia } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { computed } from "vue";

/** 允许摄像头流悬置的毫秒数 */
const CAMERA_IDLE_TIMEOUT = 10000;

/** 惰性关闭的摄像头流Composable使用的全局Composable */
const useLazyFreeCameraStreamComposableStore = defineStore("lazyFreeCameraStreamComposable", () => {
  // 摄像头流
  const {
    enabled: isCameraStreamEnabled,
    stream: cameraStream,
    isSupported: isCameraSupported,
    start: startCameraStream,
    stop: stopCameraStream
  } = useUserMedia({
    constraints: {
      audio: false,
      video: { facingMode: { ideal: "environment" } }
    }
  });

  // 定时关闭摄像头流，模块导入后此Composable将永远存在
  const {
    start: restartDisconnectTimer,
    stop: killDisconnectTimer,
    isPending: isCameraStreamStopTimerPending
  } = useTimeoutFn(() => {
    stopCameraStream();
  }, CAMERA_IDLE_TIMEOUT);

  return {
    cameraStream,
    isCameraSupported,
    isCameraStreamEnabled,
    startCameraStream,
    stopCameraStream,
    isCameraStreamStopTimerPending,
    restartDisconnectTimer,
    killDisconnectTimer
  };
});

/** 惰性关闭的摄像头流 */
export const useLazyFreeCameraStream = () => {
  const composableStore = useLazyFreeCameraStreamComposableStore();
  const { cameraStream, isCameraSupported, isCameraStreamEnabled, isCameraStreamStopTimerPending } =
    storeToRefs(composableStore);
  const { startCameraStream, restartDisconnectTimer, killDisconnectTimer } = composableStore;

  /** 摄像头流视频轨道列表 */
  const cameraStreamTracks = computed(() => cameraStream.value?.getVideoTracks());

  /** 禁用摄像头流输出 */
  const disableStreamTracks = () => {
    if (!cameraStreamTracks.value) return;
    cameraStreamTracks.value.forEach((track) => {
      track.enabled = false;
    });
  };

  /** 启用摄像头流输出 */
  const enableStreamTracks = () => {
    if (!cameraStreamTracks.value) return;
    cameraStreamTracks.value.forEach((track) => {
      track.enabled = true;
    });
  };

  /** 请求摄像头流 */
  const requestCameraStream = async () => {
    killDisconnectTimer();
    try {
      if (isCameraStreamEnabled.value) return cameraStream.value;
      return await startCameraStream();
    } finally {
      enableStreamTracks();
    }
  };

  /** 释放摄像头流 */
  const releaseCameraStream = () => {
    if (!isCameraStreamStopTimerPending.value) {
      restartDisconnectTimer();
    }
  };

  return {
    cameraStream,
    isCameraSupported,
    disableStreamTracks,
    enableStreamTracks,
    requestCameraStream,
    releaseCameraStream
  };
};
