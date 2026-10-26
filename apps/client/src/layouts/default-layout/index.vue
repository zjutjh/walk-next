<template>
  <div :class="[styles.layout, props.bgDecorationVariant === 'default' && styles.topOnly]">
    <img :src="bgTop" alt="" :class="[styles.bgDecoration, styles.top]" />
    <img :src="bgBottom" alt="" :class="[styles.bgDecoration, styles.bottom]" />

    <van-nav-bar
      v-if="props.showNavbar && route.meta.pageName"
      :title="$t(route.meta.pageName)"
      left-arrow
      safe-area-inset-top
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBack"
    />

    <main class="page-main" :class="[styles.content, props.showLogo && styles.withLogo]">
      <img v-if="props.showLogo" :src="logo" alt="Logo" :class="styles.topLogo" />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouterState } from "shared";
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
  bgDecorationVariant: "default"
});

const route = useRoute();
const { isNavigationPending } = useRouterState();
const handleBack = useBackHandler();
</script>
