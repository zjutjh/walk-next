<!-- 全局错误边界 -->
<template>
  <template v-if="error">
    <slot name="fallback" :error="error" />
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onErrorCaptured } from "vue";

import { useErrorBoundaryStore } from "./error-boundary-store";

const slots = defineSlots<{
  default?(): void;
  fallback?(props: { error: unknown }): void;
}>();

if (!slots.default && !slots.fallback) {
  throw new Error("ErrorBoundary component must have child components.");
}

const { error } = storeToRefs(useErrorBoundaryStore());

const emit = defineEmits<{
  errorCaptured: [err: unknown];
}>();

onErrorCaptured((err) => {
  error.value = err;
  emit("errorCaptured", err);

  return false;
});
</script>
