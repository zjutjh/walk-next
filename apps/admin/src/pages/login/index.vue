<template>
  <!-- 登录页 -->
  <div :class="styles.page">
    <div :class="styles.content">
      <div :class="styles.productName">精弘毅行管理系统</div>
      <div :class="styles.title">管理员登录</div>

      <van-form ref="formRef" :show-error-message="false">
        <van-field v-model="account" :rules="ACCOUNT_RULES" label="账号" placeholder="请输入账号" />
        <van-field
          v-model="password"
          :rules="PASSWORD_RULES"
          label="密码"
          placeholder="请输入密码"
          type="password"
        />
        <div :class="styles.error">{{ error?.message || "" }}</div>
      </van-form>

      <van-button
        :class="styles.loginButton"
        type="primary"
        :loading="isPending"
        block
        @click="handleLoginClick"
        >登录</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { isArray } from "lodash-es";
import type { FieldRule, FormInstance } from "vant";
import { showFailToast, showSuccessToast } from "vant";
import { ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";

import styles from "./index.module.scss";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

/** 表单组件 */
const formRef = useTemplateRef<FormInstance>("formRef");

/** 登录请求或校验错误 */
const error = ref<Error | null>(null);

/** 账号输入框的值 */
const account = ref("");
/** 账号校验规则 */
const ACCOUNT_RULES: FieldRule[] = [{ required: true, message: "请输入账号" }];
/** 密码输入框的值 */
const password = ref("");
/** 密码校验规则 */
const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入密码" }];

// 登录
const { mutate: mutateLogin, isPending } = useMutation({
  mutationFn: () =>
    walkAdminService.Auth({
      account: account.value,
      password: password.value
    }),
  onMutate: () => {
    error.value = null;
  },
  onSuccess: (data) => {
    // 清空输入内容
    account.value = "";
    password.value = "";
    // 显示提示
    showSuccessToast("登录成功");
    // 保存身份信息
    authStore.adminName = data.name;
    authStore.pointId = data.point_name;
    authStore.isLoggedIn = true;
    // 路由跳转
    router.replace(route.query.fromPath ? decodeURIComponent(route.query.fromPath as string) : "/");
  },
  onError: (err: Error) => {
    error.value = err;
    showFailToast(err.message || "登录失败");
  }
});

/** 点击登录 */
const handleLoginClick = async () => {
  account.value = account.value.trim();
  password.value = password.value.trim();

  // 表单校验
  try {
    await formRef.value?.validate();
  } catch (err) {
    if (!isArray(err)) return;
    error.value = err.at(0);
    return;
  }

  mutateLogin();
};
</script>
