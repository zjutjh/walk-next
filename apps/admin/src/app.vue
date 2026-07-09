<template>
  <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
  </van-config-provider>
</template>

<script setup lang="ts">
import { ready } from "qr-scanner-wechat";
import { showFailToast } from "vant";
import { useRoute } from "vue-router";

import { useTitleMeta } from "@/composables/use-title-meta";
import { THEME_VAR_RECORD } from "@/constants";

const route = useRoute();

useTitleMeta();

requestIdleCallback(async () => {
  try {
    await ready();
  } catch (err) {
    showFailToast("扫码模块加载失败");
    console.error(err);
  }
});
</script>
