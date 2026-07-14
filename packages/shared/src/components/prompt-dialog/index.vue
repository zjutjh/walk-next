<!-- 输入弹窗 -->
<template>
  <van-dialog
    :show="isDialogVisible"
    class="prompt-dialog"
    :title="props.title"
    :confirm-button-disabled="props.submitDisabled"
    :close-on-popstate="false"
    :close-on-click-overlay="false"
    show-cancel-button
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @open="handleDialogOpen"
  >
    <div v-if="props.description" class="prompt-dialog__description">{{ props.description }}</div>

    <van-form ref="formRef" @submit="handleSubmit">
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

import type { PromptDialogFieldConfig } from "./types";

/** 输入弹窗组件Props */
export interface PromptDialogProps {
  /** 弹窗标题 */
  title: string;
  /** 字段配置 */
  fieldConfig: Record<string, PromptDialogFieldConfig>;
  /** 弹窗描述
   * @default ""
   */
  description?: string;
  /** 是否禁用提交
   * @default false
   */
  submitDisabled?: boolean;
  /** 点击取消是否立刻关闭弹窗
   * @default true
   */
  closeOnCancel?: boolean;
}

const props = withDefaults(defineProps<PromptDialogProps>(), {
  description: "",
  submitDisabled: false,
  closeOnCancel: true
});

const emit = defineEmits<{
  submit: [value: Record<string, string>];
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

/** 提交表单 */
const handleSubmit = async () => {
  if (props.submitDisabled) return;
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  emit("submit", modelValue.value);
};

/** 点击确认按钮 */
const handleConfirm = () => {
  formRef.value?.submit();
};

/** 点击取消按钮 */
const handleCancel = () => {
  emit("cancel");
  if (props.closeOnCancel) {
    isDialogVisible.value = false;
  }
};

/** 弹窗打开 */
const handleDialogOpen = () => {
  if (!formRef.value) return;
  formRef.value.resetValidation();
};
</script>
