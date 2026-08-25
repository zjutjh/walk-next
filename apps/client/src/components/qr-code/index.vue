<template>
  <img v-if="qrDataUrl" :src="qrDataUrl" :class="props.class" alt="二维码" />
</template>

<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations";
import { toRef } from "vue";

const props = defineProps<{
  /** 二维码内容 */
  value: string;
  /** 附加类名 */
  class?: string;
}>();

/** 将二维码内容渲染为 data-url */
const qrDataUrl = useQRCode(toRef(() => props.value));
</script>
