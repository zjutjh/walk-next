<template>
  <van-form :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-model="formValue.tel"
        :rules="telRules"
        :label="t('电话号码')"
        name="tel"
        type="tel"
        maxlength="11"
        :placeholder="t('请输入电话号码')"
        autocomplete="tel"
        clearable
      />
      <van-field
        v-model="formValue.wechat"
        :label="t('微信')"
        :placeholder="t('请输入微信')"
        :name="t('微信')"
        autocomplete="off"
        clearable
      />
      <van-field
        v-model="formValue.qq"
        :label="t('QQ')"
        :placeholder="t('请输入QQ')"
        :name="t('QQ')"
        inputmode="numeric"
        autocomplete="off"
        clearable
      />
    </van-cell-group>

    <div :class="styles.submitArea">
      <van-button block round type="primary" native-type="submit" :loading="props.loading">
        {{ t("提交") }}
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { watchImmediate } from "@vueuse/core";
import type { FieldRule } from "vant";
import { computed, reactive } from "vue";
import { useI18n } from "vue-i18n";

import type { ProfileEditFormValue } from "../../types";
import { buildInitialFormValue, normalizeFormValue } from "../../utils";
import styles from "./index.module.scss";

const TEL_PATTERN = /^1[3-9]\d{9}$/;

const props = defineProps<{
  loading: boolean;
  initialValue: ProfileEditFormValue;
}>();

const emit = defineEmits<{
  submit: [value: ProfileEditFormValue];
}>();

const { t } = useI18n();

const formValue = reactive(buildInitialFormValue());

const telRules = computed<FieldRule[]>(() => [
  { required: true, message: t("请输入电话号码") },
  { pattern: TEL_PATTERN, message: t("请输入11位有效电话号码") }
]);

watchImmediate(
  () => props.initialValue,
  (value) => Object.assign(formValue, value)
);

function handleSubmit() {
  Object.assign(formValue, normalizeFormValue(formValue));
  emit("submit", { ...formValue });
}
</script>
