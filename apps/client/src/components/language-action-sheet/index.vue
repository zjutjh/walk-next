<template>
  <van-action-sheet
    v-model:show="isActionSheetVisible"
    :actions="actionSheetActions"
    :cancel-text="$t('取消')"
    close-on-click-action
    @select="handleLanguageSelect"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useUserLocale } from "@/composables";
import { LANG_META, VALID_LANG } from "@/constants";

import type { LanguageActionSheetAction } from "./types";

const { locale } = useUserLocale();

const isActionSheetVisible = defineModel<boolean>("visible", { required: true });

/** 全部受支持语言，当前语言置为禁选 */
const actionSheetActions = computed(() =>
  VALID_LANG.map(
    (langCode): LanguageActionSheetAction => ({
      name: LANG_META[langCode].name,
      disabled: langCode === locale.value,
      langCode: langCode
    })
  )
);

const handleLanguageSelect = (action: LanguageActionSheetAction) => {
  locale.value = action.langCode;
};
</script>
