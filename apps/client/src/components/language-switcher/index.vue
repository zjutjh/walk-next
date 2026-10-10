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
import { computed } from "vue";

import { useUserLocale } from "@/composables";
import { LANG_META, VALID_LANG } from "@/constants";

import styles from "./index.module.scss";

const { locale } = useUserLocale();

const languageOptions = computed(() =>
  VALID_LANG.map((value) => ({
    label: LANG_META[value].short,
    value
  }))
);
</script>
