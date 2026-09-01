<!-- 语言选择弹层 -->
<template>
  <van-action-sheet
    v-model:show="isActionSheetVisible"
    :actions="actionSheetActions"
    :cancel-text="t('取消')"
    close-on-click-action
    @select="handleLanguageSelect"
  />
</template>

<script setup lang="ts">
const { t } = useI18n();
const { locale } = useUserLocale();
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useUserLocale } from "@/composables";
import { LANG_DISPLAY_NAME, VALID_LANG } from "@/constants";

import type { LanguageActionSheetAction } from "./types";

/** 语言选择弹层是否可见 */
const isActionSheetVisible = defineModel<boolean>("visible", { required: true });

/** 语言选择弹层的可用选项列表 */
const actionSheetActions = computed<LanguageActionSheetAction[]>(() =>
  VALID_LANG.map((langCode) => ({
    name: LANG_DISPLAY_NAME[langCode],
    disabled: langCode === locale.value,
    langCode: langCode
  }))
);

/** 选择语言 */
const handleLanguageSelect = (action: LanguageActionSheetAction) => {
  locale.value = action.langCode;
};
</script>
