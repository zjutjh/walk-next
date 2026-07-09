<!-- 输入弹窗 -->
<template>
  <van-dialog
    :show="isDialogVisible"
    class="prompt-dialog"
    :title="props.title"
    :confirm-button-disabled="props.confirmDisabled"
    :close-on-popstate="false"
    :close-on-click-overlay="false"
    show-cancel-button
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @open="handleDialogOpen"
  >
    <div v-if="props.description" class="prompt-dialog__description">{{ props.description }}</div>

    <van-form ref="formRef" @submit="handleConfirm">
      <van-field
        v-for="(_, key, index) in modelValue"
        :key="key"
        v-model="modelValue[key]"
        :label="get(props.fieldConfig, [key, 'label']) ?? key"
        :placeholder="get(props.fieldConfig, [key, 'placeholder'])"
        :type="get(props.fieldConfig, [key, 'type']) ?? undefined"
        :inputmode="get(props.fieldConfig, [key, 'inputmode']) ?? undefined"
        :rules="get(props.fieldConfig, [key, 'rules']) ?? undefined"
        :enterkeyhint="index === Object.keys(modelValue).length - 1 ? 'done' : 'next'"
        autocomplete="off"
      />
    </van-form>
  </van-dialog>
</template>

<script setup lang="ts">
import "./index.scss";

import { get } from "lodash-es";
import type { FormInstance } from "vant";
import { useTemplateRef } from "vue";

import type { PromptDialogProps } from "./types";

const props = withDefaults(defineProps<PromptDialogProps>(), {
  description: "",
  confirmDisabled: false
});

const emit = defineEmits<{
  confirm: [value: Record<string, string>];
  cancel: [];
}>();

/** 表单组件 */
const formRef = useTemplateRef<FormInstance>("formRef");

/** 是否显示弹窗 */
const isDialogVisible = defineModel<boolean>("show", { required: true });
/** 表单的值 */
const modelValue = defineModel<Record<string, string>>({
  required: true
});

/** 点击确认按钮 */
const handleConfirm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  emit("confirm", modelValue.value);
};

/** 点击取消按钮 */
const handleCancel = () => {
  emit("cancel");
  isDialogVisible.value = false;
};

/** 弹窗打开 */
const handleDialogOpen = () => {
  if (!formRef.value) return;
  formRef.value.resetValidation();
};
</script>
