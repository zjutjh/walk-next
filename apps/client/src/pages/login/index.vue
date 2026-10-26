<template>
  <div :class="styles.page">
    <decoration
      :src="thumbsUpImage"
      :top="`calc(env(safe-area-inset-top, 0px) + 40px)`"
      right="-10px"
      width="400px"
      max-width="75vw"
    />
    <language-switcher />
    <div :class="styles.content">
      <h1 :class="styles.title">{{ t("登录") }}</h1>

      <login-form :loading="isLoginPending" @submit="handleLoginSubmit" @help="showLoginHelp" />

      <router-link
        :class="styles.registerLink"
        :to="{ name: 'register', query: route.query }"
        replace
      >
        {{ t("signup.guide-link") }}
      </router-link>
    </div>

    <icp-record fixed />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { RequestError, RESP_CODE } from "shared";
import { showDialog, showFailToast, showSuccessToast } from "vant";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import thumbsUpImage from "@/assets/images/thumbs-up.png";
import Decoration from "@/components/decoration/index.vue";
import IcpRecord from "@/components/icp-record/index.vue";
import LanguageSwitcher from "@/components/language-switcher/index.vue";
import { useClientUserData } from "@/composables";
import { getErrorMessage, walkClientService } from "@/utils";

import LoginForm from "./components/login-form/index.vue";
import styles from "./index.module.scss";
import type { LoginFormValue } from "./types";

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const { t } = useI18n();
const { updateClientLoginData, refreshUserInfo } = useClientUserData(queryClient);
const wrongPasswordCount = ref(0);

const showLoginHelp = () => {
  void showDialog({
    title: t("登录答疑"),
    message:
      "1.“手机号”指您注册时填写的手机号\n\n 2.在校学生/教职工的密码为统一身份认证密码；校友密码为您注册时设置的密码\n\n 3.如有其他疑问，加入精弘毅行QQ群630490686以获取更多帮助",
    confirmButtonText: t("知道了"),
    theme: "round-button",
    messageAlign: "left"
  }).catch(() => undefined);
};

const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
  mutationFn: (value: LoginFormValue) =>
    walkClientService.Login({
      // eslint-disable-next-line camelcase
      account_type: /^\d{11}$/.test(value.account) ? "tel" : "stu_id",
      account: value.account,
      password: value.password
    }),
  onSuccess: async (data) => {
    wrongPasswordCount.value = 0;
    showSuccessToast({ message: t("登录成功") });

    updateClientLoginData(data.jwt);
    await refreshUserInfo();

    const fromPath = route.query.fromPath;
    if (typeof fromPath === "string" && fromPath)
      await router.replace(decodeURIComponent(fromPath));
    else await router.replace({ name: "team-info" });
  },
  onError: (error: unknown) => {
    if (error instanceof RequestError && error.code === RESP_CODE.ACCOUNT_OR_PASSWORD_ERROR) {
      wrongPasswordCount.value += 1;
      if (wrongPasswordCount.value >= 3) showLoginHelp();
    }

    showFailToast({
      message: getErrorMessage(error, t("登录失败，请稍后重试"))
    });
  }
});

const handleLoginSubmit = (value: LoginFormValue) => {
  if (isLoginPending.value) return;
  mutateLogin(value);
};
</script>
