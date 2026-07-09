<template>
  <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
  </van-config-provider>
</template>

<script setup lang="ts">
import { ready } from "qr-scanner-wechat";
import { showFailToast } from "vant";
import { useRoute } from "vue-router";

import { useTitleMeta } from "@/composables/title-meta";
import { THEME_VAR_RECORD } from "@/constants";

import { useAdminInfo } from "./composables/admin-user-info";

const route = useRoute();
const { setupAdminInfoQuery } = useAdminInfo();

// 响应式管理页面标题
useTitleMeta();

// 预加载扫码模块
requestIdleCallback(async () => {
  try {
    await ready();
  } catch (err) {
    showFailToast("扫码模块加载失败");
    console.error(err);
  }
});

// 启动获取管理员用户信息的query
setupAdminInfoQuery();
</script>
