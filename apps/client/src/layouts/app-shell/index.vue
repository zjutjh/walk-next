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
    <main :class="styles.layoutContent">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import bgBottom from "@/assets/images/bg-bottom.svg";
import bgTop from "@/assets/images/bg-top.svg";

import styles from "./index.module.scss";

const route = useRoute();

const isBgCanvas = computed(() => route.meta.bgCanvas ?? true);
</script>
