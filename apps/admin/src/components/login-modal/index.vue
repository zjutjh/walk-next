<template>
  <van-popup
    v-model:show="isVisible"
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

      <div v-if="errorMessage" class="login-modal__error">{{ errorMessage }}</div>

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
import type { AdminAPI } from "api/types/admin";
import { computed, ref, watch } from "vue";

import { walkAdminService } from "@/utils";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
  success: [data: AdminAPI.AuthResponse];
}>();

const isVisible = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value)
});

const account = ref("");
const password = ref("");
const errorMessage = ref("");

const { mutate: mutateLogin, isPending } = useMutation({
  mutationFn: () =>
    walkAdminService.Auth({
      account: account.value,
      password: password.value
    }),
  onSuccess: (data) => {
    errorMessage.value = "";
    emit("success", data);
  },
  onError: (err: Error) => {
    errorMessage.value = err.message || "登录失败";
  }
});

const handleSubmit = () => {
  errorMessage.value = "";
  mutateLogin();
};

watch(
  () => props.show,
  (visible) => {
    if (!visible) return;
    account.value = "";
    password.value = "";
    errorMessage.value = "";
  }
);
</script>
