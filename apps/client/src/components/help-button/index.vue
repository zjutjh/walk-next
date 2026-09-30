<template>
  <button
    type="button"
    :class="styles.helpButton"
    :aria-label="props.ariaLabel"
    @click.stop="handleClick"
  >
    <van-icon :name="props.icon" />
  </button>
</template>

<script setup lang="ts">
import { showDialog } from "vant";

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

function handleClick() {
  void showDialog({
    title: props.title,
    message: props.message,
    showCancelButton: false,
    theme: "round-button"
  }).catch(() => undefined);
}
</script>
