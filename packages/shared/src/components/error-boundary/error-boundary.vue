<template>
  <slot v-if="error" name="fallback" :error="error" />
  <slot v-else />
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onErrorCaptured } from "vue";

import { useErrorBoundary } from "./use-error-boundary";

const slots = defineSlots<{
  default: (() => void) | undefined;
  fallback: ((_: { error: unknown }) => void) | undefined;
}>();

if (!slots.default && !slots.fallback) {
  throw new Error("ErrorBoundary component must have child components.");
}

const { error } = storeToRefs(useErrorBoundary());

const emit = defineEmits<{
  errorCaptured: [err: unknown];
}>();

onErrorCaptured((err) => {
  error.value = err;
  emit("errorCaptured", err);

  return false;
});
</script>
