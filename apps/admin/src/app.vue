<template>
  <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
    <router-view />

    <login-modal />
  </van-config-provider>
</template>

<script setup lang="ts">
import LoginModal from "@/components/login-modal/index.vue";
import { THEME_VAR_RECORD } from "@/constants";
</script>
