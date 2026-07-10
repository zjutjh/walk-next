<!-- 错误态 -->
<template>
  <div v-if="!isNil(props.error) && !props.disabled" v-bind="$attrs" class="error-empty">
    <van-empty class="error-empty__empty" :image="errorImageUrl" :image-size="props.imageSize">
      <template v-if="errorText" #description>{{ errorText }}</template>
    </van-empty>
    <van-button
      v-if="props.showRetry"
      class="error-empty__retry"
      round
      type="primary"
      @click="handleRetry"
      >重试</van-button
    >
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import "./index.scss";

import { isNil } from "lodash-es";
import type { EmptyProps } from "vant";
import { computed } from "vue";

import errorImageUrl from "@/assets/error.png";

export interface ErrorEmptyProps extends Pick<EmptyProps, "imageSize"> {
  /** 错误 */
  error: Error | string | null | undefined;
  /** 忽略错误，不展示错误态 */
  disabled?: boolean;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
}

const props = withDefaults(defineProps<ErrorEmptyProps>(), {
  imageSize: "1.6rem",
  disabled: false,
  showRetry: true
});

const emit = defineEmits<{
  /** 要求父组件刷新重试 */
  retry: [];
}>();

/** 显示的错误文本 */
const errorText = computed(() => {
  if (props.error instanceof Error) return props.error.message;
  return props.error;
});

/** 点击重试按钮 */
const handleRetry = () => {
  // 向父组件发出事件，父组件使用v-on监听并绑定刷新函数
  emit("retry");
};
</script>
