<template>
  <main :class="styles.page">
    <team-basic-detail
      v-if="teamDetail"
      :team="teamDetail"
      :team-type="teamTypeLabel"
      :can-edit="isCaptain"
      @back="handleBasicDetailBack"
      @edit="handleEditTeamClick"
    />

    <template v-else>
      <van-nav-bar title="基本信息" left-arrow @click-left="handleBasicDetailBack" />

      <error-empty
        :error="teamDetailError"
        :disabled="isTeamDetailLoading"
        @btn-click="handleTeamDetailRetry"
      >
        <van-loading v-if="isTeamDetailLoading" :class="styles.loading" vertical
          >加载中</van-loading
        >
        <van-empty v-else description="暂无团队详细信息" />
      </error-empty>
    </template>
  </main>

  <team-edit-popup
    :opened="isTeamEditPopupOpened"
    :team="teamDetail"
    :loading="isUpdateTeamInfoPending"
    @close="handleTeamEditClose"
    @submit="handleTeamEditSubmit"
  />
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type {
  QueryTeamDetailResponse,
  QueryTeamOverviewResponse,
  UpdateTeamInfoResponse
} from "api/types/client";
import { ErrorEmpty } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import TeamBasicDetail from "./components/team-basic-detail/index.vue";
import TeamEditPopup from "./components/team-edit-popup/index.vue";
import styles from "./index.module.scss";
import type { TeamEditFormValue } from "./types";
import { getMemberTypeLabel } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { clientUserInfo } = useClientUserData();

const isTeamEditPopupOpened = ref(false);

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const { data: teamOverview, refetch: refetchOverview } = useQuery<QueryTeamOverviewResponse, Error>(
  {
    queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW],
    queryFn: () => walkClientService.QueryTeamOverview(undefined)
  }
);

const {
  data: teamDetail,
  isLoading: isTeamDetailLoading,
  error: teamDetailError,
  refetch: refetchTeamDetail
} = useQuery<QueryTeamDetailResponse, Error>({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail(undefined)
});

const sortedMembers = computed(() => {
  const members = teamOverview.value?.members ?? [];

  return members
    .map((member, index) => ({ member, index }))
    .sort((left, right) => {
      if (left.member.role === right.member.role) return left.index - right.index;
      if (left.member.role === "captain") return -1;
      if (right.member.role === "captain") return 1;
      return left.index - right.index;
    })
    .map(({ member }) => member);
});

const teamTypeLabel = computed(() => {
  const captain = sortedMembers.value.find((member) => member.role === "captain");
  if (captain) return getMemberTypeLabel(captain.type);
  return "暂无";
});

const refreshTeamData = async () => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW]
    }),
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL] })
  ]);
};

const showErrorToast = (message: string) => {
  showFailToast({
    message,
    duration: 3000,
    position: "top"
  });
};

const { mutate: mutateUpdateTeamInfo, isPending: isUpdateTeamInfoPending } = useMutation<
  UpdateTeamInfoResponse,
  Error,
  TeamEditFormValue
>({
  mutationFn: (value) =>
    walkClientService.UpdateTeamInfo({
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
      message: "更新成功",
      duration: 3000,
      position: "top"
    });
    isTeamEditPopupOpened.value = false;
    await refreshTeamData();

    window.setTimeout(() => {
      router.replace({ name: "team-info" });
    }, 3000);
  },
  onError: (error) => {
    showErrorToast(error.message || "更新失败，请稍后重试");
  }
});

const handleTeamDetailRetry = () => {
  void refetchTeamDetail();
  void refetchOverview();
};

const handleBasicDetailBack = () => {
  router.replace({ name: "team-info" });
};

const handleEditTeamClick = () => {
  isTeamEditPopupOpened.value = true;
};

const handleTeamEditClose = () => {
  isTeamEditPopupOpened.value = false;
};

const handleTeamEditSubmit = (value: TeamEditFormValue) => {
  if (isUpdateTeamInfoPending.value) return;
  mutateUpdateTeamInfo(value);
};
</script>
