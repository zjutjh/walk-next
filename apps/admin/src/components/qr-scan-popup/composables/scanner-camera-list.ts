import { useDevicesList } from "@vueuse/core";
import { isEmpty, orderBy } from "lodash-es";
import { onBeforeUnmount, readonly, ref, watch } from "vue";

import type { ExtendedCameraInfo } from "../types";

/** 获取设备首个视频轨道的MediaTrackSettings */
const getVideoTrackSettings = async (device: MediaDeviceInfo) => {
  /** 设备的摄像头流 */
  const cameraStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      deviceId: { exact: device.deviceId }
    }
  });
  try {
    /** 首个视频轨道 */
    const primaryTrack = cameraStream.getVideoTracks().at(0);
    if (!primaryTrack) throw new Error("Video track not found.");
    return primaryTrack.getSettings();
  } finally {
    // 关闭摄像头流
    cameraStream.getTracks().forEach((track) => track.stop());
  }
};

/** 用于摄像头列表排序的函数，返回推荐度 */
const cameraListSorter = (camera: ExtendedCameraInfo) => {
  let score = 0;
  // 获取MediaTrackSettings失败
  if (isEmpty(camera.settings)) {
    score -= 100;
  }
  // 非environment摄像头
  if (camera.settings.facingMode !== "environment") {
    score -= 100;
  }
  // 分辨率反常
  if (!camera.settings.width || !camera.settings.height) {
    score -= 100;
  } else if (camera.settings.width < 1000 && camera.settings.height < 1000) {
    score -= 10;
  }
  // 有手电筒开闭信息
  if (typeof camera.settings.torch === "boolean") {
    score += 10;
  }
  return score;
};

/** 扫码可用的摄像头列表 */
export const useScannerCameraList = () => {
  const {
    videoInputs: videoDeviceList,
    isSupported: isCameraApiSupported,
    permissionGranted: isPermissionGranted,
    ensurePermissions
  } = useDevicesList({
    constraints: {
      audio: false,
      video: true
    }
  });

  /** 摄像头列表 */
  const cameraList = ref<ExtendedCameraInfo[]>([]);
  /** 是否正在更新摄像头列表 */
  const isCameraListUpdating = ref(false);

  /** 最晚开始的摄像头列表更新任务的Symbol，用于确保只有最晚任务的结果被接受 */
  let latestUpdateTaskSymbol: symbol | null = null;
  // 监听状态，执行异步任务更新摄像头列表
  watch(
    [videoDeviceList, isCameraApiSupported, isPermissionGranted],
    async ([videoDeviceListVal, isCameraApiSupportedVal, isPermissionGrantedVal]) => {
      // 无权限/API不支持/设备列表为空
      if (!isPermissionGrantedVal || !isCameraApiSupportedVal || isEmpty(videoDeviceListVal)) {
        cameraList.value = [];
        isCameraListUpdating.value = false;
        return;
      }

      isCameraListUpdating.value = true;
      /** 当前任务的Symbol */
      const currentTaskSymbol = Symbol();
      latestUpdateTaskSymbol = currentTaskSymbol;

      let result: ExtendedCameraInfo[] = [];

      // 由于设备可能不支持同时打开多个摄像头流，必须串行
      for (const device of videoDeviceListVal) {
        let videoTrackSettings: MediaTrackSettings = {};
        try {
          // 获取MediaTrackSettings
          videoTrackSettings = await getVideoTrackSettings(device);
        } catch (err) {
          // 获取MediaTrackSettings失败，静默
          console.error(err);
        }
        result.push({
          // MediaDeviceInfo的成员均是不可枚举成员，必须手动提取
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind,
          groupId: device.groupId,
          settings: videoTrackSettings
        });
        // 存在比当前任务更晚开始的任务，中止
        if (latestUpdateTaskSymbol !== currentTaskSymbol) return;
      }

      // 排序
      result = orderBy(result, [cameraListSorter], ["desc"]);
      // 更新摄像头列表
      cameraList.value = result;
      isCameraListUpdating.value = false;
    }
  );

  onBeforeUnmount(() => {
    latestUpdateTaskSymbol = null;
  });

  return {
    cameraList,
    isCameraApiSupported,
    isPermissionGranted,
    isCameraListUpdating: readonly(isCameraListUpdating),
    ensurePermissions
  };
};
