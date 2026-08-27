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
    <main :class="[styles.layoutContent, isShowLogo ? styles.layoutContentWithLogo : undefined]">
      <img v-if="isShowLogo" :src="logo" alt="Logo" :class="styles.layoutLogo" />
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import bgBottom from "@/assets/images/bg-bottom.svg";
import bgTop from "@/assets/images/bg-top.svg";
import logo from "@/assets/images/logo.png";

import styles from "./index.module.scss";

const route = useRoute();

const isBgCanvas = computed(() => route.meta.bgCanvas ?? true);
const isShowLogo = computed(() => route.meta.showLogo === true);
</script>
