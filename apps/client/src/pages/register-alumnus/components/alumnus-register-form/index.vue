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

import type { AlumnusRegisterFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: AlumnusRegisterFormValue];
}>();

const router = useRouter();
const { t } = useI18n();
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive<AlumnusRegisterFormValue>({
  name: "",
  identity: "",
  tel: "",
  password: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);

const nameRules = computed<FieldRule[]>(() => [{ required: true, message: t("请输入姓名") }]);

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
      message: t("请阅读并同意《隐私政策》"),
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
