<template>
  <div :class="styles.page">
    <van-nav-bar title="创建团队" left-arrow @click-left="handleBackClick" />

    <create-team-form :loading="isCreatePending" @submit="handleCreateSubmit" />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { showFailToast, showSuccessToast } from "vant";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import CreateTeamForm from "./components/create-team-form/index.vue";
import styles from "./index.module.scss";
import type { CreateTeamFormValue } from "./types";

const router = useRouter();
const queryClient = useQueryClient();
const { updateClientUserData } = useClientUserData();

const handleBackClick = () => {
  router.replace({ name: "team-info" });
};

const { mutate: mutateCreateTeam, isPending: isCreatePending } = useMutation({
  mutationFn: (value: CreateTeamFormValue) =>
    walkClientService.CreateTeam({
      name: value.name,
      slogan: value.slogan,
      password: value.password,
      // eslint-disable-next-line camelcase
      allow_match: value.allowMatch,
      // eslint-disable-next-line camelcase
      route_name: value.routeName
    }),
  onSuccess: async () => {
    showSuccessToast({
      message: "创建成功！",
      duration: 3000,
      position: "top"
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
  onError: (error: unknown) => {
    const message = error instanceof Error ? error.message : "创建失败，请稍后重试";

    showFailToast({
      message,
      position: "top"
    });
  }
});

const handleCreateSubmit = (value: CreateTeamFormValue) => {
  if (isCreatePending.value) return;
  mutateCreateTeam(value);
};
</script>
