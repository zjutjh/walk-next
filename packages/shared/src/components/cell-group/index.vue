<!-- 拓展功能的单元格组 -->
<template>
  <van-cell-group class="expanded-cell-group" :border="props.border" :inset="props.inset">
    <template #title>
      <div class="expanded-cell-group__title">
        <slot v-if="$slots.title" name="title" />
        <span v-else>{{ props.title }}</span>
        <van-loading v-if="props.loading" class="expanded-cell-group__title__loading" />
        <div
          v-if="!isNil(props.error) && !props.loading"
          class="expanded-cell-group__title__error-status van-haptics-feedback"
          @click="handleRetry"
        >
          <ic-outline-autorenew
            v-if="props.retryable"
            class="expanded-cell-group__title__retry-btn"
          />
          <div class="expanded-cell-group__title__error-text">
            {{ errorText }}
          </div>
        </div>
      </div>
    </template>
    <slot />
  </van-cell-group>
</template>

<script setup lang="ts">
import "./index.scss";

import { isNil } from "lodash-es";
import type { CellGroupProps } from "vant";
import { computed } from "vue";

import IcOutlineAutorenew from "~icons/ic/outline-autorenew";

export interface ExpandedCellGroupProps extends Partial<CellGroupProps> {
  /** 是否在title处显示加载态
   * @default false
   */
  loading?: boolean;
  /** 在title处显示错误态
   * @default undefined
   */
  error?: Error | string | null | undefined;
  /** 错误态点击重试
   * @default true
   */
  retryable?: boolean;
}

const props = withDefaults(defineProps<ExpandedCellGroupProps>(), {
  loading: false,
  error: undefined,
  retryable: true
});

const emit = defineEmits<{
  /** 点击错误态中的重试按钮 */
  retryClick: [];
}>();

/** 显示的错误文本 */
const errorText = computed(() => {
  if (props.error instanceof Error) return props.error.message;
  return props.error ?? "";
});

/** 重试 */
const handleRetry = () => {
  emit("retryClick");
};
</script>
