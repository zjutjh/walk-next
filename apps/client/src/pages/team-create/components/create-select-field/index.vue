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
    cancel-text="取消"
    close-on-click-action
    @select="handleActionSelect"
    @cancel="handleClose"
    @update:show="handleShowUpdate"
  />
</template>

<script setup lang="ts">
import type { ActionSheetAction } from "vant";
import { computed } from "vue";

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

const actions = computed<ActionSheetAction[]>(() =>
  props.options.map((option) => ({
    name: option.label,
    color: option.value === props.selectedValue ? "#1989fa" : undefined
  }))
);

const handleToggleClick = () => {
  emit("toggle");
};

const handleActionSelect = (action: ActionSheetAction) => {
  const selectedOption = props.options.find((option) => option.label === action.name);
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
