<template>
  <div :class="styles.page">
    <terms-of-service-md />
  </div>
</template>

<script setup lang="ts">
import termsOfServiceMd from "@/mdx/terms-of-service.mdx";

import styles from "./index.module.scss";
</script>
