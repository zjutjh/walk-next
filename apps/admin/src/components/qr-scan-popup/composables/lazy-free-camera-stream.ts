import { useTimeoutFn, useUserMedia } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { showFailToast } from "vant";
import { computed, readonly, ref, watchEffect } from "vue";

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
    /** 首个视频轨道 */
    const primaryVideoTrack = computed(() => cameraVideoTracks.value?.at(0));

    // 定时关闭摄像头流
    const {
      start: restartDisconnectTimer,
      stop: killDisconnectTimer,
      isPending: isCameraStreamStopTimerPending
    } = useTimeoutFn(() => {
      stopCameraStream();
    }, CAMERA_IDLE_TIMEOUT);

    /** 首个视频轨道是否有关联的手电筒 */
    const hasTorch = computed(
      () => typeof primaryVideoTrack.value?.getSettings().torch === "boolean"
    );
    /** 手电筒是否已开启 */
    const isTorchOn = ref(false);
    // 与手电筒初始状态保持同步
    watchEffect(() => {
      isTorchOn.value = Boolean(primaryVideoTrack.value?.getSettings().torch);
    });

    return {
      cameraStream,
      cameraVideoTracks,
      primaryVideoTrack,
      isCameraSupported,
      isCameraStreamEnabled,
      cameraDeviceId,
      startCameraStream,
      restartCameraStream,
      isCameraStreamStopTimerPending,
      restartDisconnectTimer,
      killDisconnectTimer,
      hasTorch,
      isTorchOn
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
    primaryVideoTrack,
    isCameraSupported,
    isCameraStreamEnabled,
    isCameraStreamStopTimerPending,
    cameraDeviceId,
    hasTorch,
    isTorchOn
  } = storeToRefs(composableStore);
  const { startCameraStream, restartCameraStream, restartDisconnectTimer, killDisconnectTimer } =
    composableStore;

  /** 开启手电筒 */
  const turnOnTorch = async () => {
    if (isTorchOn.value) return;
    if (!primaryVideoTrack.value) {
      showFailToast("找不到设备");
      return;
    }
    try {
      await primaryVideoTrack.value.applyConstraints({
        advanced: [{ torch: true } as MediaTrackConstraintSet]
      });
    } catch (err) {
      console.error(err);
      showFailToast("浏览器不支持\n开启手电筒");
    }
    isTorchOn.value = true;
  };

  /** 关闭手电筒 */
  const turnOffTorch = async () => {
    if (!primaryVideoTrack.value) {
      showFailToast("找不到摄像头");
      return;
    }
    try {
      await primaryVideoTrack.value.applyConstraints({
        advanced: [{ torch: false } as MediaTrackConstraintSet]
      });
    } catch (err) {
      console.error(err);
      showFailToast("关闭手电筒\n失败");
    }
    isTorchOn.value = false;
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
    setCameraDeviceId,
    hasTorch,
    isTorchOn: readonly(isTorchOn),
    turnOnTorch,
    turnOffTorch
  };
};
