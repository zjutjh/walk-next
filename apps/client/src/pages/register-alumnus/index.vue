<template>
  <main :class="styles.page">
    <div :class="styles.illustration" :style="{ '--illustration-mask': `url(${proudImage})` }">
      <img :src="proudImage" alt="" :class="styles.illustrationImage" />
    </div>

    <div :class="styles.content">
      <h1 :class="styles.title">注册</h1>

      <alumnus-register-form :loading="isRegisterPending" @submit="handleRegisterSubmit" />

      <div :class="styles.loginLink" @click="handleNavigateLogin">已有账号？去登录</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { useRouter } from "vue-router";

import proudImage from "@/assets/images/proud.png";
import { walkClientService } from "@/utils";

import AlumnusRegisterForm from "./components/alumnus-register-form/index.vue";
import styles from "./index.module.scss";
import type { AlumnusRegisterFormValue } from "./types";

const router = useRouter();

const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
  mutationFn: (value: AlumnusRegisterFormValue) =>
    walkClientService.AlumRegister({
      name: value.name,
      identity: value.identity,
      tel: value.tel,
      password: value.password
    }),
  onSuccess: () => {
    showSuccessToast({
      message: "注册成功",
      position: "top"
    });

    router.replace({ name: "login" });
  },
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : "注册失败，请稍后重试";
    showFailToast({
      message,
      position: "top"
    });
  }
});

const handleRegisterSubmit = (value: AlumnusRegisterFormValue) => {
  if (isRegisterPending.value) return;
  mutateRegister(value);
};

const handleNavigateLogin = () => {
  router.replace({ name: "login" });
};
</script>
