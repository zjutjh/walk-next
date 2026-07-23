<!-- 登录表单 -->
<template>
  <van-form
    ref="formRef"
    :class="styles.component"
    :show-error-message="false"
    :disabled="isLoginPending"
    label-align="top"
    @submit="handleSubmit"
  >
    <van-field
      v-model="formValue.account"
      :rules="ACCOUNT_RULES"
      size="large"
      label="账号"
      placeholder="请输入账号"
      left-icon="user"
      enterkeyhint="next"
      clearable
      @keyup.enter="
        (passwordFieldRef?.$el as HTMLElement | undefined)?.querySelector('input')?.focus?.()
      "
    />
    <van-field
      ref="passwordFieldRef"
      v-model="formValue.password"
      :rules="PASSWORD_RULES"
      size="large"
      label="密码"
      placeholder="请输入密码"
      left-icon="lock"
      type="password"
      enterkeyhint="done"
      clearable
      @keyup.enter="handleSubmit"
    />
    <div :class="styles.error">{{ error?.message || "" }}</div>

    <van-button
      ref="loginButtonRef"
      :class="styles.loginButton"
      type="primary"
      :loading="isLoginPending"
      block
      @click="handleSubmit"
      >登录</van-button
    >
  </van-form>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { isNil } from "lodash-es";
import type { FieldRule, FieldValidateError, FormInstance } from "vant";
import { showFailToast, showSuccessToast } from "vant";
import { ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAdminInfo } from "@/composables";
import { walkAdminService } from "@/utils";

import styles from "./index.module.scss";

const router = useRouter();
const route = useRoute();
const { updateAdminInfo } = useAdminInfo();

/** 表单组件 */
const formRef = useTemplateRef<FormInstance>("formRef");
/** 密码输入框组件 */
const passwordFieldRef = useTemplateRef("passwordFieldRef");

/** 登录表单值 */
const formValue = ref({
  account: "",
  password: ""
});

/** 登录请求或校验错误 */
const error = ref<Error | null>(null);

/** 账号校验规则 */
const ACCOUNT_RULES: FieldRule[] = [{ required: true, message: "请输入账号" }];
/** 密码校验规则 */
const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入密码" }];

// 登录
const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
  mutationFn: () => walkAdminService.Login(formValue.value),
  onMutate: () => {
    error.value = null;
  },
  onSuccess: (data) => {
    // 清空输入内容
    formValue.value = {
      account: "",
      password: ""
    };
    // 显示提示
    showSuccessToast("登录成功");
    // 保存身份信息
    updateAdminInfo({
      isLoggedIn: true,
      adminName: data.name,
      pointId: data.point_name,
      campusId: data.campus,
      permissionLevel: data.permission
    });

    // 路由跳转
    router.replace(
      route.query.fromPath && typeof route.query.fromPath === "string"
        ? { path: decodeURIComponent(route.query.fromPath) }
        : { name: "index" }
    );
  },
  onError: (err: Error) => {
    error.value = err;
    showFailToast(err.message || "登录失败");
  }
});

/** 提交登录表单 */
const handleSubmit = async () => {
  formValue.value.account = formValue.value.account.trim();
  formValue.value.password = formValue.value.password.trim();

  if (isLoginPending.value) return;

  // 表单校验
  try {
    await formRef.value?.validate();
  } catch (err) {
    if (!Array.isArray(err)) return;
    if (isNil(err[0]?.message)) return;
    error.value = new Error((err[0] satisfies FieldValidateError).message);
    return;
  }

  mutateLogin();
};
</script>
