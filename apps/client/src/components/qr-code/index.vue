<template>
  <img v-if="qrDataUrl" :src="qrDataUrl" :class="props.class" :alt="t('二维码')" />
</template>

<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations";
import { toRef } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  /** 二维码内容 */
  value: string;
  /** 附加类名 */
  class?: string;
}>();

/** 将二维码内容渲染为 data-url */
const qrDataUrl = useQRCode(toRef(() => props.value));
</script>
