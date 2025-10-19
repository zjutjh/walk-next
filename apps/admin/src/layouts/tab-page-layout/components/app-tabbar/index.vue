<template>
  <van-tabbar route>
    <van-tabbar-item
      v-for="item in tabbarRouteList"
      :key="item.path"
      :to="item.path"
      :icon="item.meta?.icon"
    >
      {{ item.meta?.title }}
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { routerConfig } from "@/configs/router";

const tabbarRouteList = routerConfig.options.routes.filter((item) => item.meta?.isTabPage);
</script>
