<template>
  <div :class="styles.page">
    <team-basic-detail
      v-if="teamDetail"
      :team="teamDetail"
      :team-type="teamTypeLabel"
      :can-edit="isCaptain"
      @edit="handleEditTeamClick"
    />

    <template v-else>
      <error-empty
        :error="teamDetailError"
        :disabled="isTeamDetailLoading"
        @btn-click="handleTeamDetailRetry"
      >
        <loading-container
          :class="styles.loadingContainer"
          :loading="isTeamDetailLoading"
          :text="t('refresh.loading')"
        >
          <van-empty v-if="!isTeamDetailLoading" :description="t('暂无团队详细信息')" />
        </loading-container>
      </error-empty>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { ErrorEmpty, LoadingContainer } from "shared";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import TeamBasicDetail from "./components/team-basic-detail/index.vue";
import styles from "./index.module.scss";
import { getMemberTypeLabel } from "./utils";

const router = useRouter();
const { t } = useI18n();
const { clientUserInfo } = useClientUserData();

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const { data: teamOverview, refetch: refetchOverview } = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW],
  queryFn: () => walkClientService.QueryTeamOverview()
});

const {
  data: teamDetail,
  isLoading: isTeamDetailLoading,
  error: teamDetailError,
  refetch: refetchTeamDetail
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail()
});

const sortedMembers = computed(() => {
  const members = teamOverview.value?.members ?? [];

  return members
    .map((member, index) => ({ member, index }))
    .toSorted((left, right) => {
      if (left.member.role === right.member.role) return left.index - right.index;
      if (left.member.role === "captain") return -1;
      if (right.member.role === "captain") return 1;
      return left.index - right.index;
    })
    .map(({ member }) => member);
});

const teamTypeLabel = computed(() => {
  const captain = sortedMembers.value.find((member) => member.role === "captain");
  if (captain) return t(getMemberTypeLabel(captain.type));
  return t("暂无");
});

const handleTeamDetailRetry = () => {
  void refetchTeamDetail();
  void refetchOverview();
};

const handleEditTeamClick = () => {
  void router.push({ name: "team-edit" });
};
</script>
