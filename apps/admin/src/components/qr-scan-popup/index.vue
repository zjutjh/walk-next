<template>
  <van-popup v-model:show="isVisible" position="bottom" class="qr-scan-popup-container">
    <loading-container class="qr-scan-popup" :loading="props.loading">
      <video ref="videoRef" class="qr-scan-popup__video" autoplay muted playsinline></video>

      <button class="qr-scan-popup__close" type="button" @click="handleClose">
        <i-mdi-close />
      </button>

      <button
        class="qr-scan-popup__album"
        :disabled="uploadQrScannerStatus === 'pending'"
        type="button"
        @click="handleUploadImageClick"
      >
        <i-mdi-image />
      </button>

      <div v-if="error" class="qr-scan-popup__error">{{ error.message }}</div>
    </loading-container>
  </van-popup>
</template>

<script setup lang="ts">
import "./index.scss";

import type { BaseIssue, BaseSchema } from "valibot";
import { showFailToast } from "vant";
import { nextTick, ref, useTemplateRef, watch } from "vue";

import LoadingContainer from "@/components/loading-container/index.vue";
import { useCameraQrScanner } from "@/composables/camera-qr-scanner";
import { useUploadQrScanner } from "@/composables/upload-qr-scanner";

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

/** 扫码弹层是否显示 */
const isVisible = defineModel<boolean>("show", { required: true });

/** 当前显示的错误 */
const error = ref<Error | null>(null);

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
  start: startCameraScanner,
  stop: stopCameraScanner,
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

/** 启动摄像头扫码 */
const startCameraScan = async () => {
  try {
    await startCameraScanner();
  } catch (err) {
    if (!(err instanceof Error)) return;
    emit("error", err);
  }
};

/** 关闭扫码弹层 */
const handleClose = () => {
  isVisible.value = false;
  stopCameraScanner();
};

/** 上传图片扫码 */
const handleUploadImageClick = async () => {
  try {
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

// 监听显隐，启动或停止摄像头扫码
watch(
  isVisible,
  async (newIsVisible) => {
    if (newIsVisible) {
      if (!videoRef.value) {
        await nextTick();
      }
      startCameraScan();
    } else {
      stopCameraScanner();
    }
  },
  { immediate: true }
);
</script>
