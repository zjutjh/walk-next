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
        maxlength="64"
        autocomplete="off"
        clearable
      />
      <van-field
        v-model="formValue.qq"
        :label="t('QQ')"
        :placeholder="t('请输入QQ')"
        :name="t('QQ')"
        maxlength="20"
        inputmode="numeric"
        autocomplete="off"
        clearable
      />
      <van-field :label="t('户籍')" name="home">
        <template #input>
          <van-radio-group v-model="formValue.home" direction="horizontal">
            <van-radio v-for="option in HOME_OPTIONS" :key="option.value" :name="option.value">
              {{ t(option.label) }}
            </van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        v-model="formValue.identity"
        :rules="identityRules"
        :label="t('证件号码')"
        name="identity"
        maxlength="18"
        :placeholder="t('请输入证件号码')"
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
import { computed, reactive } from "vue";
import { useI18n } from "vue-i18n";

import { HOME_OPTIONS } from "@/constants/home";
import { getIdentityRules, getTelRules } from "@/constants/validation";

import type { ProfileEditFormValue } from "../../types";
import { buildInitialFormValue, normalizeFormValue } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
  initialValue: ProfileEditFormValue;
}>();

const emit = defineEmits<{
  submit: [value: ProfileEditFormValue];
}>();

const { t } = useI18n();
const telRules = getTelRules(t);

const formValue = reactive(buildInitialFormValue());
const identityRules = computed(() => getIdentityRules(t, formValue.home));

watchImmediate(
  () => props.initialValue,
  (value) => Object.assign(formValue, value)
);

function handleSubmit() {
  Object.assign(formValue, normalizeFormValue(formValue));
  emit("submit", { ...formValue });
}
</script>
