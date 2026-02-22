<template>
  <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
    <router-view />
  </van-config-provider>
</template>

<script setup lang="ts">
import { THEME_VAR_RECORD } from "@/configs/theme-vars";
</script>
