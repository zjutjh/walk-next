<!-- 语言选择弹层 -->
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

/** 语言选择弹层是否可见 */
const isActionSheetVisible = defineModel<boolean>("visible", { required: true });

/** 语言选择弹层的可用选项列表 */
const actionSheetActions = computed(() =>
  VALID_LANG.map(
    (langCode): LanguageActionSheetAction => ({
      name: LANG_META[langCode].name,
      disabled: langCode === locale.value,
      langCode: langCode
    })
  )
);

/** 选择语言 */
const handleLanguageSelect = (action: LanguageActionSheetAction) => {
  locale.value = action.langCode;
};
</script>
