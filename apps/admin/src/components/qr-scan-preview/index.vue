<template>
  <van-popup v-model:show="isVisible" position="bottom" class="qr-scan-preview-container">
    <div class="qr-scan-preview">
      <video ref="videoRef" class="qr-scan-preview__video" autoplay muted playsinline></video>

      <button class="qr-scan-preview__close" type="button" @click="handleClose">
        <i-mdi-close />
      </button>

      <button class="qr-scan-preview__album" type="button" @click="handlePickImage">
        <i-mdi-image />
      </button>

      <div v-if="errorMessage" class="qr-scan-preview__error">{{ errorMessage }}</div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import "./index.scss";

import { computed, nextTick, type Ref, ref, watch } from "vue";

import { CAMERA_FACING_MODE, type QrCodeData, useQrScanner } from "@/composables/use-qr-scanner";

const props = withDefaults(
  defineProps<{
    show: boolean;
    scanInterval?: number;
    facingMode?: (typeof CAMERA_FACING_MODE)[keyof typeof CAMERA_FACING_MODE];
  }>(),
  {
    scanInterval: 120,
    facingMode: CAMERA_FACING_MODE.Environment
  }
);

const emit = defineEmits<{
  "update:show": [value: boolean];
  success: [data: QrCodeData];
  error: [message: string];
}>();

const isVisible = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value)
});

const videoRef = ref<HTMLVideoElement>() as Ref<HTMLVideoElement>;
const isStarting = ref(false);

const { isActive, errorMessage, scannedQrCodeData, start, stop, scanFromImage } = useQrScanner(
  videoRef,
  {
    scanInterval: props.scanInterval,
    facingMode: props.facingMode
  }
);

const handleStart = async () => {
  isStarting.value = true;
  const ok = await start();
  if (!ok && errorMessage.value) {
    emit("error", errorMessage.value);
  }
  isStarting.value = false;
};

const handleClose = () => {
  isVisible.value = false;
  stop();
};

const handlePickImage = async () => {
  isStarting.value = true;
  const ok = await scanFromImage();
  if (!ok && errorMessage.value) {
    emit("error", errorMessage.value);
  }
  isStarting.value = false;
};

watch(scannedQrCodeData, (data) => {
  if (!data) return;
  emit("success", data);
  isVisible.value = false;
});

watch(
  () => props.show,
  async (visible) => {
    if (!visible) {
      stop();
      return;
    }
    await nextTick();
    await handleStart();
    if (!isActive.value) {
      isVisible.value = false;
    }
  }
);
</script>
