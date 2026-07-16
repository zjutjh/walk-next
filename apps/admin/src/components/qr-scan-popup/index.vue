<!-- 扫码弹层 -->
<template>
  <van-popup
    v-model:show="isVisible"
    position="bottom"
    class="qr-scan-popup"
    @open="handleScanPopupOpen"
    @closed="handleScanPopupClosed"
  >
    <loading-container class="qr-scan-popup__content" :loading="props.loading">
      <!-- 摄像头视频 -->
      <video
        v-show="isPermissionGranted && !isNoCamera"
        ref="videoRef"
        class="qr-scan-popup__video"
        autoplay
        muted
        playsinline
      ></video>

      <!-- 扫码错误 -->
      <div v-if="error" class="qr-scan-popup__error">{{ error.message }}</div>

      <!-- 关闭按钮 -->
      <van-button
        class="qr-scan-popup__btn qr-scan-popup__close-btn"
        round
        @click="handleCloseClick"
      >
        <template #icon><i-mdi-close /></template>
      </van-button>

      <!-- 左下角按钮列表 -->
      <div class="qr-scan-popup__left-bottom">
        <!-- 切换摄像头按钮 -->
        <van-button
          v-if="isPermissionGranted && (isCameraListUpdating || cameraList.length > 1)"
          class="qr-scan-popup__btn"
          :loading="isCameraListUpdating"
          round
          @click="handleSwitchCameraClick"
        >
          <template #icon><i-mdi-camera-flip /></template>
        </van-button>

        <!-- 手电筒按钮 -->
        <van-button
          v-if="isPermissionGranted && hasTorch"
          class="qr-scan-popup__btn"
          round
          @click="handleSwitchTorchClick"
        >
          <template #icon>
            <i-mdi-flashlight-off v-if="isTorchOn" />
            <i-mdi-flashlight v-else />
          </template>
        </van-button>
      </div>

      <!-- 右下角按钮列表 -->
      <div class="qr-scan-popup__right-bottom">
        <!-- 上传图片按钮 -->
        <van-button
          class="qr-scan-popup__btn"
          :disabled="uploadQrScannerStatus === 'pending'"
          round
          @click="handleUploadImageClick"
        >
          <template #icon><i-mdi-image /></template>
        </van-button>
      </div>

      <!-- 浏览器不支持提示 -->
      <error-empty
        v-if="!isCameraApiSupported"
        error="浏览器不支持扫码，请拍照上传"
        btn-text="上传图片"
        @btn-click="handleUploadImageClick"
      />
      <!-- 权限被拒绝提示 -->
      <error-empty
        v-else-if="isCameraPermissionRefused"
        error="扫码权限被拒绝，请检查设置"
        btn-text="刷新"
        @btn-click="handleReloadWindow"
      />
      <!-- 获取权限中提示 -->
      <div v-else-if="!isPermissionGranted" class="qr-scan-popup__permission-tip">
        <div>正在请求您的摄像头权限</div>
        <div>请按提示操作</div>
      </div>
      <!-- 无摄像头提示 -->
      <error-empty
        v-else-if="isNoCamera"
        error="未找到可用摄像头"
        btn-text="上传图片"
        @btn-click="handleUploadImageClick"
      />
      <!-- 准备中提示 -->
      <div v-else-if="!isCameraVideoPlayable" class="qr-scan-popup__loading">正在连接摄像头...</div>
    </loading-container>

    <!-- 摄像头选择弹层 -->
    <van-action-sheet
      v-model:show="isCameraPickerVisible"
      :actions="cameraPickerActions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectCamera"
    />
  </van-popup>
</template>

<script setup lang="ts">
import "./index.scss";

import { find, isEmpty } from "lodash-es";
import { ErrorEmpty, LoadingContainer } from "shared";
import type { BaseIssue, BaseSchema } from "valibot";
import { showFailToast } from "vant";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";

import { useCameraQrScanner } from "./composables/camera-qr-scanner";
import { useLazyFreeCameraStream } from "./composables/lazy-free-camera-stream";
import { useScannerCameraList } from "./composables/scanner-camera-list";
import { useUploadQrScanner } from "./composables/upload-qr-scanner";
import type { CameraPickerAction, ExtendedCameraInfo } from "./types";

const props = defineProps<{
  /** 是否处于加载态 */
  loading?: boolean;
  /** 二维码数据的类型模式 */
  schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
  /** 两次扫描之间的间隔(毫秒) */
  scanInterval?: number;
}>();

const emit = defineEmits<{
  /** 扫码成功 */
  success: [data: unknown];
  /** 扫码出错 */
  error: [message: Error];
}>();

/** 视频元素 */
const videoRef = useTemplateRef("videoRef");

const { setCameraDeviceId, cameraDeviceId, hasTorch, isTorchOn, turnOnTorch, turnOffTorch } =
  useLazyFreeCameraStream();

// 摄像头列表
const {
  cameraList,
  isCameraApiSupported,
  isPermissionGranted,
  isCameraListUpdating,
  ensurePermissions
} = useScannerCameraList();
/** 是否没有可用摄像头 */
const isNoCamera = computed(() => !isCameraListUpdating.value && isEmpty(cameraList.value));

/** 扫码弹层是否可见 */
const isVisible = defineModel<boolean>("show", { required: true });

/** 当前显示的错误 */
const error = ref<Error | null>(null);

/** 无摄像头权限，且请求摄像头权限失败 */
const isCameraPermissionRefused = ref(false);

/** 摄像头选择弹层是否可见 */
const isCameraPickerVisible = ref(false);

/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  error.value = null;
  emit("success", data);
};

/** 扫码出错 */
const handleScanError = (err: Error) => {
  showFailToast(err.message);
  error.value = err;
  emit("error", err);
};

// 摄像头扫码
const {
  status: cameraScannerStatus,
  start: startCameraScanner,
  stop: stopCameraScanner,
  isCameraVideoPlayable,
  switchToIdle: pauseCameraScanner,
  switchToActive: resumeCameraScanner
} = useCameraQrScanner(
  videoRef,
  {
    scanInterval: props.scanInterval,
    onSuccess: handleScanSuccess,
    onError: handleScanError
  },
  props.schema
);

// 上传图片扫码
const { requestUploadQrCodeImage, status: uploadQrScannerStatus } = useUploadQrScanner(
  {
    onSuccess: handleScanSuccess,
    onError: handleScanError
  },
  props.schema
);

/** 关闭扫码弹层 */
const handleCloseClick = () => {
  isVisible.value = false;
};

/** 上传图片扫码 */
const handleUploadImageClick = async () => {
  try {
    if (isTorchOn.value) {
      // 尝试关闭手电筒
      await turnOffTorch();
    }
    pauseCameraScanner();
    await requestUploadQrCodeImage();
  } catch (err) {
    if (!(err instanceof Error)) return;
    emit("error", err);
  } finally {
    if (isVisible.value) {
      resumeCameraScanner();
    }
  }
};

/** 扫码弹窗打开 */
const handleScanPopupOpen = async () => {
  if (!videoRef.value) {
    await nextTick();
  }
  // 获取权限
  isCameraPermissionRefused.value = !(await ensurePermissions());
  /**
   * 不可以在此处启动摄像头扫码，否则会与useScannerCameraList竞争摄像头流，在部分移动设备上出错
   * 启动放在了cameraList和isVisible的监听器回调中
   */
};

/** 扫码弹窗关闭（动画结束） */
const handleScanPopupClosed = () => {
  stopCameraScanner();
};

/** 点击切换摄像头 */
const handleSwitchCameraClick = () => {
  if (cameraList.value.length <= 2) {
    /** 另一个摄像头 */
    const anotherCamera = find(
      cameraList.value,
      (camera) => camera.deviceId !== cameraDeviceId.value
    );
    // 无其他摄像头
    if (!anotherCamera) {
      showFailToast("无法连接其他摄像头");
      return;
    }
    setCameraDeviceId(anotherCamera.deviceId);
  } else {
    // 摄像头多于2个，显示选择弹层
    isCameraPickerVisible.value = true;
  }
};

/** 点击切换手电筒 */
const handleSwitchTorchClick = () => {
  if (isTorchOn.value) {
    turnOffTorch();
  } else {
    turnOnTorch();
  }
};

/** 生成摄像头备注 */
const buildCameraSubname = (device: ExtendedCameraInfo) => {
  const list = [];
  switch (device.settings.facingMode) {
    case "user":
      list.push("前置摄像头");
      break;
    case "environment":
      list.push("后置摄像头");
      break;
  }
  if (typeof device.settings.torch === "boolean") {
    list.push("关联手电筒");
  }
  return list.join(" ");
};

/** 获取摄像头在弹层中的图标 */
const getCameraIcon = (device: ExtendedCameraInfo) => {
  if (cameraDeviceId.value === device.deviceId) return "success";
  if (device.settings.facingMode === "user") return "user";
  return "photograph";
};

/** 摄像头选择弹层的选项列表 */
const cameraPickerActions = computed<CameraPickerAction[]>(() =>
  cameraList.value.map((device) => ({
    name: device.label,
    subname: buildCameraSubname(device),
    deviceInfo: device,
    disabled: cameraDeviceId.value === device.deviceId,
    color: cameraDeviceId.value === device.deviceId ? "var(--van-primary-color)" : undefined,
    icon: getCameraIcon(device)
  }))
);

/** 选择摄像头 */
const handleSelectCamera = (action: CameraPickerAction) => {
  isCameraPickerVisible.value = false;
  setCameraDeviceId(action.deviceInfo.deviceId);
};

/** 刷新页面 */
const handleReloadWindow = () => {
  window.location.reload();
};

// 监听状态，完成摄像头扫码初始化与启动
watch(
  [cameraList, isCameraListUpdating, isVisible],
  ([cameraListVal, isCameraListUpdatingVal, isVisibleVal]) => {
    // 摄像头列表为空
    if (!cameraListVal[0]) return;

    // 未指定摄像头或指定的摄像头不在列表中，则设置为第一个摄像头
    if (
      !cameraDeviceId.value ||
      !cameraListVal.some((camera) => camera.deviceId === cameraDeviceId.value)
    ) {
      setCameraDeviceId(cameraListVal[0].deviceId);
    }

    // 摄像头列表更新未结束，不启动扫码，以免竞争摄像头流
    if (isCameraListUpdatingVal) return;

    if (isVisibleVal && cameraScannerStatus.value === "off") {
      // 启动摄像头扫码
      startCameraScanner();
    }
  },
  { immediate: true }
);
</script>
