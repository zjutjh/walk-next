<template>
  <loading-container :class="styles.page" :loading="isIframeLoading">
    <iframe :class="styles.iframe" :src="FEEDBACK_QA_URL" @load="handleIframeLoad" />
  </loading-container>
</template>

<script setup lang="ts">
import { LoadingContainer } from "shared";

const FEEDBACK_QA_URL = import.meta.env.VITE_FEEDBACK_QA_URL;

import { ref } from "vue";

import styles from "./index.module.scss";

const isIframeLoading = ref(true);

/** iframe 加载完成 */
const handleIframeLoad = () => {
  isIframeLoading.value = false;
};
</script>
