<!-- 错误边界 -->
<template>
  <error-boundary @error-captured="handleErrorCaptured">
    <template #fallback>
      <div :class="styles?.errorContainer">
        <span :class="styles?.errorTitle">糟糕！页面出错了<br />Oops! Error Occurred</span>
        <span>
          以下是报错信息。请通过
          <a :href="FEEDBACK_QA_URL"> 反馈问卷 </a>
          联系我们解决。
          <br />
          Please contact us via the
          <a :href="FEEDBACK_QA_URL"> feedback questionnaire </a>
          for assistance.
        </span>
        <div :class="styles?.errorInfo">
          <span>{{ lastError?.message }}</span>
          <pre>{{ lastError?.stack }}</pre>
        </div>
        <div :class="styles?.buttons">
          <button v-if="historyStateBack" @click="handleBackClick()">返回上页 Back</button>
          <button @click="handleRefresh()">刷新重试 Refresh</button>
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

import styles from "./index.module.scss";

const FEEDBACK_QA_URL = import.meta.env.VITE_FEEDBACK_QA_URL;

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
