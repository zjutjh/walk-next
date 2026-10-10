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
      :left-disabled="isNavigationPending"
      :class="styles.navbar"
      @click-left="handleBackClick"
    />

    <main :class="styles.content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouterState } from "shared";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import styles from "./index.module.scss";
import pattern from "./pattern-dash-line.svg";

const route = useRoute();
const router = useRouter();
const { isNavigationPending } = useRouterState();

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
