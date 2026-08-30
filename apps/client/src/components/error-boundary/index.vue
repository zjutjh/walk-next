<!-- 错误边界 -->
<template>
  <error-boundary @error-captured="handleErrorCaptured">
    <template #fallback>
      <div :class="styles?.errorContainer">
        <span :class="styles?.errorTitle">{{ t("糟糕！页面出错了") }}</span>
        <span>{{ t("以下是报错信息。请联系开发人员修复。") }}</span>
        <div :class="styles?.errorInfo">
          <span>{{ lastError?.message }}</span>
          <pre>{{ lastError?.stack }}</pre>
        </div>
        <div :class="styles?.buttons">
          <button v-if="historyStateBack" @click="handleBackClick()">{{ t("返回") }}</button>
          <button @click="handleRefresh()">{{ t("刷新重试") }}</button>
        </div>
      </div>
    </template>
    <slot />
  </error-boundary>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ErrorBoundary, unknownToError, useErrorBoundaryStore } from "shared";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import styles from "./index.module.scss";

const { t } = useI18n();

const { error } = storeToRefs(useErrorBoundaryStore());

/** 最新的一个出错 */
const lastError = computed(() => unknownToError(error.value));

/** 历史记录中的上个地址(不包括Origin) */
const historyStateBack = computed(() => history.state?.back);

/** 控制台报错 */
function handleErrorCaptured(err: unknown) {
  console.error(err);
}

/** 点击返回上页按钮 */
function handleBackClick() {
  try {
    location.replace(historyStateBack.value);
  } catch (err) {
    console.error(err);
  }
}

/** 点击刷新页面按钮 */
function handleRefresh() {
  try {
    location.reload();
  } catch (err) {
    console.error(err);
  }
}
</script>
