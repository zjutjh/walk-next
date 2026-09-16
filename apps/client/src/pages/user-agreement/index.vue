<template>
  <div :class="styles.page">
    <user-agreement-md />
    <van-back-top />
  </div>
</template>

<script setup lang="ts">
import userAgreementMd from "@/mdx/user-agreement.mdx";

import styles from "./index.module.scss";
</script>
