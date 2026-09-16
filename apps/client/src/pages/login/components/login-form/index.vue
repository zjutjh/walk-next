<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("账号") }}</label>
      <van-field
        v-model="formValue.account"
        :class="styles.fieldInput"
        :rules="accountRules"
        name="account"
        maxlength="32"
        :placeholder="t('请输入手机号或学工号')"
        autocomplete="username"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("密码") }}</label>
      <van-field
        v-model="formValue.password"
        :class="styles.fieldInput"
        :rules="createRequiredRuleWithMessage(t('请输入密码'))"
        :type="isPasswordVisible ? 'text' : 'password'"
        name="password"
        maxlength="60"
        :placeholder="t('请输入密码')"
        autocomplete="current-password"
        clearable
      >
        <template #right-icon>
          <button
            :class="styles.eyeButton"
            type="button"
            :aria-label="t('切换密码显示')"
            @click.stop="handlePasswordVisibleClick"
          >
            <van-icon :name="isPasswordVisible ? 'eye-o' : 'closed-eye'" />
          </button>
        </template>
      </van-field>
    </div>

    <div :class="styles.agreementRow">
      <van-checkbox v-model="isAgreed" shape="round">
        <span>{{ t("您已阅读并同意") }}</span>
        <span :class="styles.termsLink" @click.stop="handleNavigateTerms">
          {{ t("《用户协议与隐私政策》") }}
        </span>
      </van-checkbox>
    </div>

    <div :class="styles.submitArea">
      <van-button native-type="submit" :loading="props.loading">
        {{ t("提交") }}
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { createRequiredRuleWithMessage } from "shared";
import type { FormInstance } from "vant";
import { showToast } from "vant";
import { reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { TEL_PATTERN } from "@/constants/validation";

import type { LoginFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: LoginFormValue];
}>();

const router = useRouter();
const { t } = useI18n();
const formRef = useTemplateRef<FormInstance>("formRef");

const accountRules = [
  ...createRequiredRuleWithMessage(t("请输入手机号或学工号")),
  {
    validator: (value: string) => !value || value.length !== 11 || TEL_PATTERN.test(value),
    message: t("请输入正确的电话号码")
  }
];

const formValue = reactive<LoginFormValue>({
  account: "",
  password: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNavigateTerms = () => {
  router.push({ name: "userAgreement" });
};

const handleSubmit = async () => {
  formValue.account = formValue.account.trim();
  formValue.password = formValue.password.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isAgreed.value) {
    showToast({
      message: t("请阅读并同意《用户协议与隐私政策》"),
      position: "bottom"
    });
    return;
  }

  emit("submit", {
    account: formValue.account,
    password: formValue.password
  });
};
</script>
