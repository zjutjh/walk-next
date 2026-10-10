<template>
  <van-cell
    :class="styles.card"
    :title="props.title"
    :label="props.description"
    is-link
    center
    clickable
    @click="handleSelectClick"
  >
    <template #icon>
      <div :class="styles.iconBox">
        <component :is="props.icon" :class="styles.icon" />
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import type { Component } from "vue";

import styles from "./index.module.scss";

const props = defineProps<{
  title: string;
  description: string;
  icon: Component;
}>();

const emit = defineEmits<{
  select: [];
}>();

const handleSelectClick = () => {
  emit("select");
};
</script>
