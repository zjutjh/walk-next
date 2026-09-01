<template>
  <div :class="styles.layout">
    <!-- 背景装饰图 -->
    <img
      :src="bgTop"
      alt=""
      :class="[styles.bg, styles.bgTop, props.bgDecorationVariant === 'top' ? styles.topOnly : '']"
    />
    <img
      :src="bgBottom"
      alt=""
      :class="[
        styles.bg,
        styles.bgBottom,
        props.bgDecorationVariant === 'top' ? styles.topOnly : ''
      ]"
    />

    <!-- 顶部Logo -->
    <img v-if="props.showLogo" :src="logo" alt="Logo" :class="styles.topLogo" />

    <!-- 导航栏 -->
    <van-nav-bar
      v-if="props.showNavbar"
      :title="pageTitle"
      left-arrow
      safe-area-inset-top
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBackClick"
    />

    <main
      :class="[
        styles.content,
        props.showLogo ? styles.withLogo : '',
        props.noPadding ? styles.noPadding : ''
      ]"
    >
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouterState } from "shared";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import bgBottom from "@/assets/images/bg-bottom.svg";
import bgTop from "@/assets/images/bg-top.svg";
import logo from "@/assets/images/logo.png";

import styles from "./index.module.scss";
import type { DefaultLayoutProps } from "./types";

const props = withDefaults(defineProps<DefaultLayoutProps>(), {
  showNavbar: true,
  showBgDecoration: true,
  showLogo: false,
  noPadding: false
});

const route = useRoute();
const router = useRouter();
const { isNavigationPending } = useRouterState();

/** 页面标题 */
const pageTitle = computed(() => route.meta.pageName);

const handleBackClick = () => {
  if (router.options.history.state.back) router.back();
  else {
    const matched = route.matched;
    if (matched.length >= 2) {
      const fullPath = route.path;
      const lastSegmentEnd = fullPath.lastIndexOf("/");
      const parentPath = lastSegmentEnd > 0 ? fullPath.substring(0, lastSegmentEnd) : "/";
      router.replace(parentPath);
    } else router.replace("/");
  }
};
</script>
