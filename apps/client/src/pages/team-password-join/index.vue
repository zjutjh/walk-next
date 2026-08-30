<template>
  <div :class="styles.page">
    <van-nav-bar :title="t('密码加入')" left-arrow @click-left="handleBackClick" />

    <password-join-form :loading="isJoinPending" @submit="handleJoinSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { RequestError, RESP_CODE } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import PasswordJoinForm from "./components/password-join-form/index.vue";
import styles from "./index.module.scss";
import type { PasswordJoinFormValue } from "./types";

const router = useRouter();
const { t } = useI18n();
const queryClient = useQueryClient();
const { updateClientUserData } = useClientUserData();

const handleBackClick = () => {
  router.replace({ name: "team-info" });
};

const getJoinErrorMessage = (error: Error) => {
  if (error instanceof RequestError && error.code === RESP_CODE.NO_JOIN_CHANCE) {
    return t("加入团队次数已用完");
  }

  return t("编号密码有误，请重新输入！");
};

const { mutate: mutateJoinTeam, isPending: isJoinPending } = useMutation({
  mutationFn: (value: PasswordJoinFormValue) =>
    walkClientService.JoinTeam({
      // eslint-disable-next-line camelcase
      team_id: value.teamId,
      password: value.password
    }),
  onSuccess: async () => {
    showSuccessToast({
      message: t("加入成功！"),
      duration: 3000
    });

    const userInfo = await queryClient.fetchQuery({
      queryKey: [CLIENT_QUERY_KEY.USER.SELF],
      queryFn: () => walkClientService.QueryUserInfo(undefined)
    });

    updateClientUserData({ userInfo });

    window.setTimeout(() => {
      router.replace({ name: "team-info" });
    }, 3000);
  },
  onError: (error) => {
    showFailToast(getJoinErrorMessage(error));
  }
});

const handleJoinSubmit = (value: PasswordJoinFormValue) => {
  if (isJoinPending.value) return;
  mutateJoinTeam(value);
};
</script>
