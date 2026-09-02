<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("姓名") }}</label>
      <van-field
        v-model="formValue.name"
        :class="styles.fieldInput"
        :rules="nameRules"
        name="name"
        :placeholder="t('请输入姓名')"
        autocomplete="name"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ stuIdLabel }}</label>
      <van-field
        v-model="formValue.stuId"
        :class="styles.fieldInput"
        :rules="stuIdRules"
        name="stuId"
        :placeholder="stuIdPrompt"
        autocomplete="off"
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
        :rules="passwordRules"
        :type="isPasswordVisible ? 'text' : 'password'"
        name="password"
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
      <label :class="styles.fieldLabel">{{ t("QQ（选填）") }}</label>
      <van-field
        v-model="formValue.qq"
        :class="styles.fieldInput"
        name="qq"
        :placeholder="t('请输入QQ')"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ t("微信（选填）") }}</label>
      <van-field
        v-model="formValue.wechat"
        :class="styles.fieldInput"
        name="wechat"
        :placeholder="t('请输入微信')"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.agreementRow">
      <van-checkbox v-model="isAgreed" shape="round">
        <span>{{ t("您已阅读并同意") }}</span>
        <span :class="styles.termsLink" @click.stop="handleNavigateTerms">
          {{ t("《隐私政策》") }}
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
import type { FieldRule, FormInstance } from "vant";
import { showToast } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import type { SchoolRegisterFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  userType: "student" | "teacher";
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: SchoolRegisterFormValue];
}>();

const router = useRouter();
const { t } = useI18n();
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive<SchoolRegisterFormValue>({
  name: "",
  stuId: "",
  identity: "",
  tel: "",
  password: "",
  qq: "",
  wechat: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);

const isStudent = computed(() => props.userType === "student");

const stuIdLabel = computed(() => (isStudent.value ? t("学号") : t("工号")));

/** 学号/工号的占位提示，同时用作必填校验文案 */
const stuIdPrompt = computed(() => (isStudent.value ? t("请输入学号") : t("请输入工号")));

const nameRules = computed<FieldRule[]>(() => [{ required: true, message: t("请输入姓名") }]);

const stuIdRules = computed<FieldRule[]>(() => [{ required: true, message: stuIdPrompt.value }]);

const identityRules = computed<FieldRule[]>(() => [
  { required: true, message: t("请输入身份证号码") },
  {
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: t("请输入正确的身份证号码")
  }
]);

const telRules = computed<FieldRule[]>(() => [
  { required: true, message: t("请输入电话号码") },
  { pattern: /^1[3-9]\d{9}$/, message: t("请输入正确的电话号码") }
]);

const passwordRules = computed<FieldRule[]>(() => [{ required: true, message: t("请输入密码") }]);

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNavigateTerms = () => {
  router.push({ name: "terms" });
};

const handleSubmit = async () => {
  formValue.name = formValue.name.trim();
  formValue.stuId = formValue.stuId.trim();
  formValue.identity = formValue.identity.trim();
  formValue.tel = formValue.tel.trim();
  formValue.password = formValue.password.trim();
  formValue.qq = formValue.qq?.trim();
  formValue.wechat = formValue.wechat?.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isAgreed.value) {
    showToast({
      message: t("请阅读并同意《隐私政策》"),
      position: "bottom"
    });
    return;
  }

  emit("submit", {
    name: formValue.name,
    stuId: formValue.stuId,
    identity: formValue.identity,
    tel: formValue.tel,
    password: formValue.password,
    qq: formValue.qq || undefined,
    wechat: formValue.wechat || undefined
  });
};
</script>
