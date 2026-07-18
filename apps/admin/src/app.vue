<template>
  <error-boundary>
    <van-config-provider :theme-vars="THEME_VAR_RECORD" theme-vars-scope="global">
      <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
    </van-config-provider>
  </error-boundary>
</template>

<script setup lang="ts">
import "@vant/touch-emulator";

import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useAdminInfo, useTitleMeta } from "@/composables";
import { THEME_VAR_RECORD } from "@/constants";

const route = useRoute();
const { setupAdminInfoQuery } = useAdminInfo();

// 响应式管理页面标题
useTitleMeta();

// 启动获取管理员用户信息的query
setupAdminInfoQuery();
</script>
