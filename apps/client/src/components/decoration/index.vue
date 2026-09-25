<template>
  <div :class="[styles.decoration, mirror && styles.mirror]" :style="decorationStyle">
    <img :src="src" alt="" :class="styles.decorationImage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import styles from "./index.module.scss";

const props = withDefaults(
  defineProps<{
    src: string;
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    width?: string;
    maxWidth?: string;
    mirror?: boolean;
  }>(),
  {
    top: "auto",
    right: "auto",
    bottom: "auto",
    left: "auto",
    width: "150px",
    maxWidth: "40vw",
    mirror: false
  }
);

const decorationStyle = computed(() => ({
  "--illustration-mask": `url(${props.src})`,
  "--decoration-top": props.top,
  "--decoration-right": props.right,
  "--decoration-bottom": props.bottom,
  "--decoration-left": props.left,
  "--decoration-width": props.width,
  "--decoration-max-width": props.maxWidth
}));
</script>
