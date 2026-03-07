<!-- 加载态 -->
<template>
  <div class="loading-container">
    <slot />
    <div
      :style="{
        pointerEvents: props.loading && props.modal ? undefined : 'none',
        opacity: isOverlayVisible ? undefined : '0'
      }"
      class="loading-container__overlay"
    >
      <van-loading
        :type="props.type"
        :vertical="props.vertical"
        :size="props.size"
        :color="props.color"
        :text-size="props.textSize"
        :text-color="props.textColor"
        ><slot name="text">{{ props.text }}</slot></van-loading
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import "./index.scss";

import { refDebounced } from "@vueuse/core";
import type { LoadingProps } from "vant";
import { computed, toRef } from "vue";

export interface LoadingContainerProps extends Partial<LoadingProps> {
  /** 加载图标下方的文本 */
  text?: string;
  /** 是否正在加载 */
  loading: boolean;
  /** 加载状态从false变为true持续多少毫秒后，视觉上才显示遮罩。为0则立即显示
   * @default 0
   */
  delay?: number;
  /** 是否阻断与被遮罩内容的交互
   * @default true
   */
  modal?: boolean;
}

const props = withDefaults(defineProps<LoadingContainerProps>(), {
  vertical: true,
  size: "20%",
  text: "",
  delay: 0,
  modal: true
});

/** 遮罩是否视觉上可见 */
const isOverlayVisible = refDebounced(
  toRef(() => props.loading),
  computed(() => (props.loading ? props.delay : 0))
);
</script>
