<template>
  <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />

    <login-modal />
  </van-config-provider>
</template>

<script setup lang="ts">
import { ready } from "qr-scanner-wechat";
import { showFailToast } from "vant";
import { useRoute } from "vue-router";

import LoginModal from "@/components/login-modal/index.vue";
import { THEME_VAR_RECORD } from "@/constants";

const route = useRoute();

requestIdleCallback(async () => {
  try {
    await ready();
  } catch (err) {
    showFailToast("扫码模块加载失败");
    console.error(err);
  }
});
</script>
