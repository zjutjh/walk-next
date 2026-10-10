<template>
  <div :class="styles.layout">
    <!-- #region 背景装饰图 -->
    <img
      :src="bgTop"
      alt=""
      :class="[
        styles.bgDecoration,
        styles.top,
        props.bgDecorationVariant === 'default' ? styles.topOnly : ''
      ]"
    />
    <img
      :src="bgBottom"
      alt=""
      :class="[
        styles.bgDecoration,
        styles.bottom,
        props.bgDecorationVariant === 'default' ? styles.topOnly : ''
      ]"
    />
    <!-- #endregion -->

    <!-- 顶部Logo -->
    <img v-if="props.showLogo" :src="logo" alt="Logo" :class="styles.topLogo" />

    <!-- 导航栏 -->
    <van-nav-bar
      v-if="props.showNavbar && pageTitle"
      :title="pageTitle"
      left-arrow
      safe-area-inset-top
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBack"
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
import { useRoute } from "vue-router";

import logo from "@/assets/images/logo.png";
import { useBackHandler } from "@/composables";

import bgBottom from "./bg-bottom.svg";
import bgTop from "./bg-top.svg";
import styles from "./index.module.scss";
import type { DefaultLayoutProps } from "./types";

const props = withDefaults(defineProps<DefaultLayoutProps>(), {
  showNavbar: true,
  showLogo: false,
  noPadding: false,
  bgDecorationVariant: "default"
});

const route = useRoute();
const { isNavigationPending } = useRouterState();
const handleBack = useBackHandler();

/** 页面标题 */
const pageTitle = computed(() => route.meta.pageName);
</script>
