<template>
  <van-field
    :class="styles.selectField"
    :model-value="props.valueLabel"
    :label="props.label"
    :name="props.label"
    :placeholder="props.placeholder"
    :error-message="props.error"
    readonly
    clickable
    is-link
    @click="handleToggleClick"
  />

  <van-action-sheet
    :show="props.opened"
    :actions="actions"
    :title="props.label"
    :cancel-text="t('取消')"
    close-on-click-action
    @select="handleActionSelect"
    @cancel="handleClose"
    @update:show="handleShowUpdate"
  />
</template>

<script setup lang="ts">
import type { ActionSheetAction } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { CreateSelectOption } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  label: string;
  placeholder: string;
  options: readonly CreateSelectOption[];
  selectedValue: string;
  valueLabel: string;
  error: string;
  opened: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  select: [value: string];
  close: [];
}>();

const { t } = useI18n();

const actions = computed<ActionSheetAction[]>(() =>
  props.options.map((option) => ({
    name: t(option.label),
    color: option.value === props.selectedValue ? "#1989fa" : undefined
  }))
);

const handleToggleClick = () => {
  emit("toggle");
};

/** 按索引取选项，避免翻译后的 `action.name` 与原始 label 匹配不上 */
const handleActionSelect = (_action: ActionSheetAction, index: number) => {
  const selectedOption = props.options[index];
  if (!selectedOption) return;
  emit("select", selectedOption.value);
};

const handleClose = () => {
  emit("close");
};

const handleShowUpdate = (show: boolean) => {
  if (show) return;
  emit("close");
};
</script>
