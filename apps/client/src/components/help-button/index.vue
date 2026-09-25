<template>
  <button
    type="button"
    :class="styles.helpButton"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <van-icon :name="props.icon" />
  </button>
</template>

<script setup lang="ts">
import { confirmDialog } from "@/composables";

import styles from "./index.module.scss";

const props = withDefaults(
  defineProps<{
    title: string;
    message?: string;
    icon?: string;
    ariaLabel?: string;
  }>(),
  { icon: "question-o", message: "", ariaLabel: "帮助" }
);

async function handleClick() {
  await confirmDialog({
    title: props.title,
    message: props.message,
    dismissText: null
  });
}
</script>
