<!-- 拓展功能的单元格组 -->
<template>
  <van-cell-group class="expanded-cell-group" :border="props.border" :inset="props.inset">
    <template #title>
      <div class="expanded-cell-group__title">
        <slot v-if="$slots.title" name="title" />
        <span v-else>{{ props.title }}</span>
        <van-loading v-if="props.loading" class="expanded-cell-group__title__loading" />
      </div>
    </template>
    <slot />
  </van-cell-group>
</template>

<script setup lang="ts">
import "./index.scss";

import type { CellGroupProps } from "vant";

export interface ExpandedCellGroupProps extends Partial<CellGroupProps> {
  /** 是否在title处显示加载态
   * @default false
   */
  loading?: boolean;
}

const props = withDefaults(defineProps<ExpandedCellGroupProps>(), {
  loading: false
});
</script>
