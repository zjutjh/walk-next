<template>
  <main :class="styles.page">
    <van-nav-bar title="密码加入" left-arrow @click-left="handleBackClick" />

    <password-join-form :loading="isJoinPending" @submit="handleJoinSubmit" />
  </main>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import PasswordJoinForm from "./components/password-join-form/index.vue";
import styles from "./index.module.scss";
import type { PasswordJoinFormValue } from "./types";

const router = useRouter();
const queryClient = useQueryClient();
const { updateClientUserData } = useClientUserData();

const handleBackClick = () => {
  router.push({ name: "team-info" });
};

const { mutate: mutateJoinTeam, isPending: isJoinPending } = useMutation({
  mutationFn: (value: PasswordJoinFormValue) =>
    walkClientService.JoinTeam({
      team_id: value.teamId,
      password: value.password
    }),
  onSuccess: async () => {
    showSuccessToast({
      message: "加入成功！",
      duration: 3000
    });

    const userInfo = await queryClient.fetchQuery({
      queryKey: [CLIENT_QUERY_KEY.USER.SELF],
      queryFn: () => walkClientService.QueryUserInfo(undefined)
    });

    updateClientUserData({ userInfo });

    window.setTimeout(() => {
      router.replace({ name: "team-detail" });
    }, 3000);
  },
  onError: () => {
    showFailToast("编号密码有误，请重新输入！");
  }
});

const handleJoinSubmit = (value: PasswordJoinFormValue) => {
  if (isJoinPending.value) return;
  mutateJoinTeam(value);
};
</script>
