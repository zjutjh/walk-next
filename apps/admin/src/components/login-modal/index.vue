<template>
  <van-popup
    v-model:show="isLoginModalVisible"
    class="login-modal"
    position="center"
    round
    :close-on-click-overlay="false"
    :closeable="false"
    :close-on-popstate="false"
  >
    <div class="login-modal__content">
      <h3 class="login-modal__title">管理员登录</h3>
      <van-field v-model="account" label="账号" placeholder="请输入账号" />
      <van-field v-model="password" label="密码" type="password" placeholder="请输入密码" />

      <div class="login-modal__error">{{ error?.message || "" }}</div>

      <van-button
        class="login-modal__submit"
        type="primary"
        :loading="isPending"
        @click="handleSubmit"
      >
        登录
      </van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import "./index.scss";

import { useMutation } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";

import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";

const authStore = useAuthStore();

const isLoginModalVisible = computed(() => !authStore.isLoggedIn);

const error = ref<Error | null>(null);

const account = ref("");
const password = ref("");

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
  },
  onError: (err: Error) => {
    error.value = err;
    showFailToast(err.message || "登录失败");
  }
});

const handleSubmit = () => {
  account.value = account.value.trim();
  password.value = password.value.trim();
  if (!account.value || !password.value) {
    error.value = new Error("请输入账号和密码");
    return;
  }

  mutateLogin();
};
</script>
