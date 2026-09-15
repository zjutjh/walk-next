<template>
  <div :class="styles.page">
    <decoration :src="proudImage" right="-75px" bottom="0" width="400px" max-width="75vw" />
    <decoration :src="tomatoJamImage" top="120px" right="0" width="100px" max-width="25vw" mirror />
    <decoration :src="tomatoJamImage" top="250px" left="0" width="150px" max-width="37.5vw" />

    <div :class="styles.content">
      <h1 :class="styles.title">{{ t(pageName) }}</h1>

      <school-register-form
        :user-type="props.userType"
        :loading="isRegisterPending"
        @submit="handleRegisterSubmit"
      />

      <router-link :class="styles.loginLink" :to="{ name: 'login', query: route.query }" replace>
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

import SchoolRegisterForm from "./components/school-register-form/index.vue";
import styles from "./index.module.scss";
import type { SchoolRegisterFormValue } from "./types";

const props = withDefaults(
  defineProps<{
    userType?: "student" | "teacher";
  }>(),
  {
    userType: "student"
  }
);

const route = useRoute();
const pageName = route.meta.pageName as string;
const router = useRouter();
const { t } = useI18n();

const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
  mutationFn: (value: SchoolRegisterFormValue) => {
    const payload = {
      name: value.name,
      // eslint-disable-next-line camelcase
      stu_id: value.stuId,
      identity: value.identity,
      tel: value.tel,
      password: value.password,
      qq: value.qq,
      wechat: value.wechat
    };

    return props.userType === "teacher"
      ? walkClientService.TeacherRegister(payload)
      : walkClientService.StudentRegister(payload);
  },
  onSuccess: () => {
    showSuccessToast({
      message: t("注册成功"),
      position: "top"
    });

    router.replace({ name: "login", query: route.query });
  },
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : t("注册失败，请稍后重试");
    showFailToast({
      message,
      position: "top"
    });
  }
});

const handleRegisterSubmit = (value: SchoolRegisterFormValue) => {
  if (isRegisterPending.value) return;
  mutateRegister(value);
};
</script>
