<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-model="formValue.teamId"
        :rules="createRequiredRuleWithMessage(t('请输入团队编号'))"
        :label="t('团队编号')"
        name="teamId"
        :placeholder="t('请输入团队编号')"
        type="digit"
        inputmode="numeric"
        autocomplete="off"
        clearable
      />

      <van-field
        v-model="formValue.password"
        :rules="createRequiredRuleWithMessage(t('请输入团队密码'))"
        :type="isPasswordVisible ? 'text' : 'password'"
        :label="t('团队密码')"
        name="password"
        maxlength="64"
        :placeholder="t('请输入团队密码')"
        autocomplete="off"
        clearable
      >
        <template #right-icon>
          <button
            :class="styles.eyeButton"
            type="button"
            :aria-label="t('切换密码显示')"
            @click.stop="handlePasswordVisibleClick()"
          >
            <van-icon :name="isPasswordVisible ? 'eye-o' : 'closed-eye'" />
          </button>
        </template>
      </van-field>
    </van-cell-group>

    <div :class="styles.submitArea">
      <van-button block round type="primary" native-type="submit" :loading="props.loading">
        {{ t("立即加入") }}
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import { createRequiredRuleWithMessage } from "shared";
import type { FormInstance } from "vant";
import { reactive, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

import type { PasswordJoinFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
  initialTeamId?: string;
  initialPassword?: string;
}>();

const emit = defineEmits<{
  submit: [value: PasswordJoinFormValue];
}>();

const { t } = useI18n();
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive({
  teamId: props.initialTeamId ?? "",
  password: props.initialPassword ?? ""
});

const [isPasswordVisible, handlePasswordVisibleClick] = useToggle();

const handleSubmit = async () => {
  formValue.teamId = formValue.teamId.trim();
  formValue.password = formValue.password.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  emit("submit", {
    teamId: Number(formValue.teamId),
    password: formValue.password
  });
};
</script>
