<template>
  <div :class="styles.authLayout">
    <img :src="bgAuthTop" alt="" :class="[styles.authLayoutBg, styles.authLayoutBgTop]" />
    <img :src="bgAuthBottom" alt="" :class="[styles.authLayoutBg, styles.authLayoutBgBottom]" />
    <main :class="styles.authLayoutContent">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import bgAuthBottom from "@/assets/images/bg-bottom.svg";
import bgAuthTop from "@/assets/images/bg-top.svg";

import styles from "./index.module.scss";
</script>
