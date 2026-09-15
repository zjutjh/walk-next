<template>
  <div :class="styles.page">
    <registration-terms-md />
  </div>
</template>

<script setup lang="ts">
import registrationTermsMd from "@/mdx/registration-terms";

import styles from "./index.module.scss";
</script>
