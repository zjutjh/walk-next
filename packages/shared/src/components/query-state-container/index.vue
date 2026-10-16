<!-- 查询状态容器：统一 error-empty + loading-container + van-empty 嵌套模式 -->
<template>
  <error-empty
    :error="effectiveError"
    :disabled="effectiveDisabled"
    :btn-text="btnText"
    @btn-click="emit('retry')"
  >
    <loading-container
      :class="loading && 'query-state-container'"
      :loading="loading"
      :text="loadingText"
    >
      <slot />
      <van-empty v-if="emptyDescription && !hasData && !loading" :description="emptyDescription" />
    </loading-container>
  </error-empty>
</template>

<script setup lang="ts">
import "./index.scss";

import { computed } from "vue";

import ErrorEmpty from "../error-empty/index.vue";
import LoadingContainer from "../loading-container/index.vue";

const props = withDefaults(
  defineProps<{
    /** 错误 */
    error?: Error | string | null;
    /** 是否正在加载 */
    loading: boolean;
    /** 查询到的数据。已有数据时抑制错误态：刷新失败不会把内容整页换成错误态；空数组视为无数据 */
    data?: unknown;
    /** 重试按钮文本 */
    btnText?: string;
    /** 加载遮罩文本 */
    loadingText?: string;
    /** 空态描述文本。不传则不展示 van-empty */
    emptyDescription?: string;
  }>(),
  {
    error: undefined,
    data: undefined,
    btnText: "重试",
    loadingText: "",
    emptyDescription: undefined
  }
);

const emit = defineEmits<{ retry: [] }>();

/** 空数组同样视为无数据，避免列表查询拿到空结果时被误判为有数据 */
const hasData = computed(() =>
  Array.isArray(props.data) ? props.data.length > 0 : Boolean(props.data)
);

/** 有数据时抑制错误展示 */
const effectiveError = computed(() => (hasData.value ? undefined : props.error));

/** 加载中或有数据时禁用错误态 */
const effectiveDisabled = computed(() => props.loading || hasData.value);
</script>
