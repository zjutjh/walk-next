<template>
  <main :class="styles.page">
    <div :class="styles.illustration" :style="{ '--illustration-mask': `url(${thumbsUpImage})` }">
      <img :src="thumbsUpImage" alt="" :class="styles.illustrationImage" />
    </div>

    <div :class="styles.content">
      <h1 :class="styles.title">登录</h1>

      <login-form :loading="isLoginPending" @submit="handleLoginSubmit" />

      <div :class="styles.registerLink" @click="handleNavigateRegister">没有账号？戳我注册</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { useRoute, useRouter } from "vue-router";

import thumbsUpImage from "@/assets/images/thumbs-up.png";
import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import LoginForm from "./components/login-form/index.vue";
import styles from "./index.module.scss";
import type { LoginFormValue } from "./types";

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const { updateClientLoginData, updateClientUserData } = useClientUserData(queryClient);

const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
  mutationFn: (value: LoginFormValue) =>
    walkClientService.Login({
      tel: value.tel,
      password: value.password
    }),
  onSuccess: async (data) => {
    showSuccessToast({
      message: "登录成功",
      position: "top"
    });

    updateClientLoginData(data.jwt);

    const userInfo = await queryClient.fetchQuery({
      queryKey: [CLIENT_QUERY_KEY.USER.SELF],
      queryFn: () => walkClientService.QueryUserInfo(undefined)
    });

    updateClientUserData({ userInfo });

    const fromPath = route.query.fromPath;
    if (typeof fromPath === "string" && fromPath) {
      await router.replace({ path: decodeURIComponent(fromPath) });
    } else {
      await router.replace({ name: "team-info" });
    }
  },
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : "登录失败，请稍后重试";
    showFailToast({
      message,
      position: "top"
    });
  }
});

const handleLoginSubmit = (value: LoginFormValue) => {
  if (isLoginPending.value) return;
  mutateLogin(value);
};

const handleNavigateRegister = () => {
  router.push({ name: "register" });
};
</script>
