<template>
  <div :class="styles.layout">
    <img
      :src="bgTop"
      alt=""
      :class="[
        styles.layoutBg,
        styles.layoutBgTop,
        isBgCanvas ? styles.layoutBgTopCanvas : undefined
      ]"
    />
    <img
      :src="bgBottom"
      alt=""
      :class="[
        styles.layoutBg,
        styles.layoutBgBottom,
        isBgCanvas ? styles.layoutBgBottomHidden : undefined
      ]"
    />
    <img v-if="isShowLogo" :src="logo" alt="Logo" :class="styles.layoutLogo" />
    <van-nav-bar
      v-else-if="pageTitle"
      :title="pageTitle"
      left-arrow
      safe-area-inset-top
      :left-disabled="isNavigationPending"
      :class="styles.layoutNavbar"
      @click-left="handleBackClick"
    />
    <main :class="[styles.layoutContent, isShowLogo ? styles.layoutContentWithLogo : undefined]">
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

const route = useRoute();
const router = useRouter();
const { isNavigationPending } = useRouterState();

const isBgCanvas = computed(() => route.meta.bgCanvas ?? true);
const isShowLogo = computed(() => route.meta.showLogo === true);
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
