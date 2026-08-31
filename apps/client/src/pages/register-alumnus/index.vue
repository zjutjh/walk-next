<template>
  <div :class="styles.page">
    <decoration :src="proudImage" right="-75px" bottom="0" width="400px" max-width="75vw" />
    <decoration :src="tomatoJamImage" top="120px" right="0" width="100px" max-width="25vw" mirror />
    <decoration :src="tomatoJamImage" top="250px" left="0" width="150px" max-width="37.5vw" />
    <div :class="styles.content">
      <h1 :class="styles.title">{{ t(pageName) }}</h1>

      <alumnus-register-form :loading="isRegisterPending" @submit="handleRegisterSubmit" />

      <router-link :class="styles.loginLink" to="/login" replace>
        {{ t("已有账号？去登录") }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import proudImage from "@/assets/images/proud.png";
import tomatoJamImage from "@/assets/images/tomato-jam.png";
import Decoration from "@/components/decoration/index.vue";
import { walkClientService } from "@/utils";

import AlumnusRegisterForm from "./components/alumnus-register-form/index.vue";
import styles from "./index.module.scss";
import type { AlumnusRegisterFormValue } from "./types";

const pageName = useRoute().meta.pageName as string;
const router = useRouter();
const { t } = useI18n();

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
      message: t("注册成功"),
      position: "top"
    });

    router.replace({ name: "login" });
  },
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : t("注册失败，请稍后重试");
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
</script>
