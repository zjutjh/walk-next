<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("姓名") }}</label>
      <van-field
        v-model="formValue.name"
        :class="styles.fieldInput"
        :rules="createRequiredRuleWithMessage(t('请输入姓名'))"
        name="name"
        maxlength="128"
        :placeholder="t('请输入姓名')"
        autocomplete="name"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("身份证号") }}</label>
      <van-field
        v-model="formValue.identity"
        :class="styles.fieldInput"
        :rules="identityRules"
        name="identity"
        maxlength="128"
        :placeholder="t('请输入身份证号码')"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("电话号码") }}</label>
      <van-field
        v-model="formValue.tel"
        :class="styles.fieldInput"
        :rules="telRules"
        name="tel"
        type="tel"
        maxlength="11"
        :placeholder="t('请输入电话号码')"
        autocomplete="tel"
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
        autocomplete="new-password"
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

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("确认密码") }}</label>
      <van-field
        v-model="confirmPassword"
        :class="styles.fieldInput"
        :rules="confirmPasswordRules"
        :type="isPasswordVisible ? 'text' : 'password'"
        name="confirmPassword"
        maxlength="60"
        :placeholder="t('请再次输入密码')"
        autocomplete="new-password"
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
        {{ t("注册") }}
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { createRequiredRuleWithMessage } from "shared";
import type { FieldRule, FormInstance } from "vant";
import { showToast } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { getIdentityRules, getTelRules } from "@/constants/validation";

import type { AlumniRegisterFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: AlumniRegisterFormValue];
}>();

const router = useRouter();
const { t } = useI18n();
const telRules = getTelRules(t);
const identityRules = getIdentityRules(t);
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive<AlumniRegisterFormValue>({
  name: "",
  identity: "",
  tel: "",
  password: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);
const confirmPassword = ref("");

const confirmPasswordRules = computed<FieldRule[]>(() => [
  ...createRequiredRuleWithMessage(t("请再次输入密码")),
  {
    validator: (value: string) => value === formValue.password,
    message: t("两次输入的密码不一致")
  }
]);

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNavigateTerms = () => {
  router.push({ name: "userAgreement" });
};

const handleSubmit = async () => {
  formValue.name = formValue.name.trim();
  formValue.identity = formValue.identity.trim();
  formValue.tel = formValue.tel.trim();
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
    name: formValue.name,
    identity: formValue.identity,
    tel: formValue.tel,
    password: formValue.password
  });
};
</script>
