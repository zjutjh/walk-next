<!-- 错误态 -->
<template>
  <div v-if="!isNil(props.error) && !props.disabled" v-bind="$attrs" class="error-empty">
    <van-empty class="error-empty__empty" :image="errorImageUrl" :image-size="props.imageSize">
      <template v-if="errorText" #description>{{ errorText }}</template>
    </van-empty>
    <van-button
      v-if="props.showBtn"
      class="error-empty__btn"
      round
      type="primary"
      @click="handleBtnClick"
      >{{ props.btnText }}</van-button
    >
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import "./index.scss";

import { isNil } from "lodash-es";
import type { EmptyProps } from "vant";
import { computed } from "vue";

import errorImageUrl from "../../assets/error.png";

export interface ErrorEmptyProps extends Pick<EmptyProps, "imageSize"> {
  /** 错误 */
  error: Error | string | null | undefined;
  /** 忽略错误，不展示错误态
   * @default false
   */
  disabled?: boolean;
  /** 是否显示按钮
   * @default true
   */
  showBtn?: boolean;
  /** 按钮文本
   * @default "重试"
   */
  btnText?: string;
}

const props = withDefaults(defineProps<ErrorEmptyProps>(), {
  imageSize: "1.6rem",
  disabled: false,
  showBtn: true,
  btnText: "重试"
});

const emit = defineEmits<{
  /** 点击错误态中的按钮 */
  btnClick: [];
}>();

/** 显示的错误文本 */
const errorText = computed(() => {
  if (props.error instanceof Error) return props.error.message;
  return props.error ?? "";
});

/** 点击错误态中的按钮 */
const handleBtnClick = () => {
  emit("btnClick");
};
</script>
