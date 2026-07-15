import { useTimeoutFn, useUserMedia } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { computed, readonly, ref } from "vue";

import { ADMIN_PINIA_PERSIST_KEY } from "@/constants/pinia-persist-key";

/** 允许摄像头流悬置的毫秒数 */
const CAMERA_IDLE_TIMEOUT = 10000 as const;

/** 惰性关闭的摄像头流Composable使用的全局Composable */
const useLazyFreeCameraStreamComposableStore = defineStore(
  "lazyFreeCameraStreamComposable",
  () => {
    /** 使用的摄像头的deviceId，会持久化 未指定时浏览器自动选择一个environment摄像头 */
    const cameraDeviceId = ref<string>();

    /** 摄像头媒体约束 */
    const mediaConstraints = computed(() => ({
      audio: false,
      video: cameraDeviceId.value
        ? {
            deviceId: { exact: cameraDeviceId.value }
          }
        : {
            facingMode: {
              ideal: "environment"
            }
          }
    }));

    // 摄像头流
    const {
      enabled: isCameraStreamEnabled,
      stream: cameraStream,
      isSupported: isCameraSupported,
      start: startCameraStream,
      stop: stopCameraStream,
      restart: restartCameraStream
    } = useUserMedia({
      constraints: mediaConstraints
    });

    /** 摄像头流视频轨道列表 */
    const cameraVideoTracks = computed(() => cameraStream.value?.getVideoTracks());

    // 定时关闭摄像头流
    const {
      start: restartDisconnectTimer,
      stop: killDisconnectTimer,
      isPending: isCameraStreamStopTimerPending
    } = useTimeoutFn(() => {
      stopCameraStream();
    }, CAMERA_IDLE_TIMEOUT);

    return {
      cameraStream,
      cameraVideoTracks,
      isCameraSupported,
      isCameraStreamEnabled,
      cameraDeviceId,
      startCameraStream,
      restartCameraStream,
      isCameraStreamStopTimerPending,
      restartDisconnectTimer,
      killDisconnectTimer
    };
  },
  {
    persist: {
      key: ADMIN_PINIA_PERSIST_KEY.ADMIN_CAMERA_SETTINGS,
      pick: ["cameraDeviceId"]
    }
  }
);

/** 惰性关闭的摄像头流 */
export const useLazyFreeCameraStream = () => {
  const composableStore = useLazyFreeCameraStreamComposableStore();
  const {
    cameraStream,
    cameraVideoTracks,
    isCameraSupported,
    isCameraStreamEnabled,
    isCameraStreamStopTimerPending,
    cameraDeviceId
  } = storeToRefs(composableStore);
  const { startCameraStream, restartCameraStream, restartDisconnectTimer, killDisconnectTimer } =
    composableStore;

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

  /** 禁用摄像头流输出 */
  const disableStreamTracks = () => {
    if (!cameraVideoTracks.value) return;
    cameraVideoTracks.value.forEach((track) => {
      track.enabled = false;
    });
  };

  /** 启用摄像头流输出 */
  const enableStreamTracks = () => {
    if (!cameraVideoTracks.value) return;
    cameraVideoTracks.value.forEach((track) => {
      track.enabled = true;
    });
  };

  /** 设置摄像头deviceId */
  const setCameraDeviceId = (deviceId: string) => {
    cameraDeviceId.value = deviceId;
  };

  return {
    cameraStream,
    isCameraSupported,
    disableStreamTracks,
    enableStreamTracks,
    requestCameraStream,
    releaseCameraStream,
    restartCameraStream,
    cameraDeviceId: readonly(cameraDeviceId),
    setCameraDeviceId
  };
};
