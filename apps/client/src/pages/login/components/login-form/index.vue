<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">电话号码</label>
      <van-field
        v-model="formValue.tel"
        :class="styles.fieldInput"
        :rules="TEL_RULES"
        name="tel"
        type="tel"
        maxlength="11"
        placeholder="请输入电话号码"
        autocomplete="tel"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">密码</label>
      <van-field
        v-model="formValue.password"
        :class="styles.fieldInput"
        :rules="PASSWORD_RULES"
        :type="isPasswordVisible ? 'text' : 'password'"
        name="password"
        placeholder="请输入密码"
        autocomplete="current-password"
        clearable
      >
        <template #right-icon>
          <button
            :class="styles.eyeButton"
            type="button"
            aria-label="切换密码显示"
            @click.stop="handlePasswordVisibleClick"
          >
            <van-icon :name="isPasswordVisible ? 'eye-o' : 'closed-eye'" />
          </button>
        </template>
      </van-field>
    </div>

    <div :class="styles.agreementRow">
      <van-checkbox v-model="isAgreed" shape="round">
        <span>您已阅读并同意</span>
        <span :class="styles.termsLink" @click.stop="handleNavigateTerms">《隐私政策》</span>
      </van-checkbox>
    </div>

    <div :class="styles.submitArea">
      <van-button :class="styles.submitButton" native-type="submit" :loading="props.loading">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import type { FieldRule, FormInstance } from "vant";
import { showToast } from "vant";
import { reactive, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import type { LoginFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: LoginFormValue];
}>();

const router = useRouter();
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive<LoginFormValue>({
  tel: "",
  password: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);

const TEL_RULES: FieldRule[] = [
  { required: true, message: "请输入电话号码" },
  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的电话号码" }
];

const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入密码" }];

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNavigateTerms = () => {
  router.push({ name: "terms" });
};

const handleSubmit = async () => {
  formValue.tel = formValue.tel.trim();
  formValue.password = formValue.password.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isAgreed.value) {
    showToast({
      message: "请阅读并同意《隐私政策》",
      position: "bottom"
    });
    return;
  }

  emit("submit", {
    tel: formValue.tel,
    password: formValue.password
  });
};
</script>
