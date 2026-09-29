<template>
  <div :class="styles.switcher" role="group" :aria-label="$t('语言')">
    <button
      v-for="(option, index) in languageOptions"
      :key="option.value"
      type="button"
      :class="[styles.option, locale === option.value && styles.active]"
      :aria-pressed="locale === option.value"
      @click="locale = option.value"
    >
      <span v-if="index" :class="styles.separator">/</span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useUserLocale } from "@/composables";

import styles from "./index.module.scss";

const { locale } = useUserLocale();

const languageOptions = [
  { label: "中", value: "zh-Hans" },
  { label: "繁", value: "zh-Hant" },
  { label: "EN", value: "en" }
] as const;
</script>
