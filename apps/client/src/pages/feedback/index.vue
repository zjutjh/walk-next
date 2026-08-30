<template>
  <iframe :class="styles.iframe" :src="FEEDBACK_QA_URL" />
</template>

<script setup lang="ts">
const FEEDBACK_QA_URL = import.meta.env.VITE_FEEDBACK_QA_URL;

import styles from "./index.module.scss";
</script>
