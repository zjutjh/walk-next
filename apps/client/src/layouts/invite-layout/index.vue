<template>
  <div :class="styles.layout">
    <img :src="pattern" alt="" :class="styles.bgBottomLeft" />
    <img :src="pattern" alt="" :class="styles.bgTopRight" />

    <span :class="[styles.sideText, styles.sideTextLeft]" aria-hidden="true">
      ///jinghongyixing jinghongyixing///
    </span>
    <span :class="[styles.sideText, styles.sideTextRight]" aria-hidden="true">
      ///jinghongyixing jinghongyixing///
    </span>

    <van-nav-bar
      v-if="pageTitle"
      :title="pageTitle"
      left-arrow
      safe-area-inset-top
      :border="false"
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBack"
    />

    <main :class="styles.content">
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
import pattern from "./pattern-dash-line.svg";

const route = useRoute();
const { isNavigationPending } = useRouterState();
const handleBack = useBackHandler();

const pageTitle = computed(() => route.meta.pageName);
</script>
