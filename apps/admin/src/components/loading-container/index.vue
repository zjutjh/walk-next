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

import type { LoadingProps } from "vant";
import { ref, watch } from "vue";

export interface LoadingContainerProps extends Partial<LoadingProps> {
  /** 加载图标下方的文本 */
  text?: string;
  /** 是否正在加载 */
  loading: boolean;
  /** 加载已经持续多少毫秒时，视觉上显示遮罩，设为0时立即显示。
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
const isOverlayVisible = ref(false);
/** 使遮罩可见的计时器 */
let loadingDelayTimer: number | undefined;
watch(
  () => props.loading,
  (newValue) => {
    // 重置使遮罩可见的计时器
    if (loadingDelayTimer !== undefined) {
      clearTimeout(loadingDelayTimer);
      loadingDelayTimer = undefined;
    }
    // 已退出加载状态，立刻将遮罩重置为不可见
    if (newValue === false) {
      isOverlayVisible.value = false;
      return;
    }
    // 已进入加载状态
    if (props.delay === 0) {
      // 无延时，立刻使遮罩可见
      isOverlayVisible.value = true;
      return;
    }
    // 延时后使遮罩可见
    loadingDelayTimer = setTimeout(() => {
      isOverlayVisible.value = true;
    }, props.delay);
  },
  { immediate: true }
);
</script>
