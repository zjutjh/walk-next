<template>
  <div :class="styles.layout">
    <van-nav-bar
      v-if="props.showNavbar && pageTitle"
      :title="pageTitle"
      left-arrow
      safe-area-inset-top
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBack"
    />

    <main class="page-main" :class="styles.content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouterState } from "shared";
import { computed } from "vue";
import { useRoute } from "vue-router";

import { useBackHandler } from "@/composables";

import styles from "./index.module.scss";
import type { PlainLayoutProps } from "./types";

const props = withDefaults(defineProps<PlainLayoutProps>(), {
  showNavbar: true
});

const route = useRoute();
const { isNavigationPending } = useRouterState();
const handleBack = useBackHandler();

const pageTitle = computed(() => route.meta.pageName);
</script>
