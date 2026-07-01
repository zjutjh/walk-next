<!-- 地图适应屏幕大小（回到cover尺寸）功能 -->
<template>
  <div v-show="props.isMapNotFit" @click="handleFuncBtnClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
export interface FloatingMenuFitScreenFuncProps {
  /** 地图是否与视口不吻合 */
  isMapNotFit: boolean;
  /** 使地图适应屏幕大小（回到cover尺寸）的函数 */
  fitToScreenFunc: () => void;
}

const props = defineProps<FloatingMenuFitScreenFuncProps>();

/** 插槽中的功能按钮被点击 */
const handleFuncBtnClick = () => {
  if (!props.isMapNotFit) return;
  props.fitToScreenFunc();
};
</script>
