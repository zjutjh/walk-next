<template>
  <div :class="styles.page">
    <privacy-policy-md />
  </div>
</template>

<script setup lang="ts">
import privacyPolicyMd from "@/mdx/privacy-policy.mdx";

import styles from "./index.module.scss";
</script>
