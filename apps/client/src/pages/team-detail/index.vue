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
      <query-state-container
        :error="teamDetailError"
        :loading="isTeamDetailLoading"
        :btn-text="t('重试')"
        :loading-text="t('refresh.loading')"
        :empty-description="t('暂无团队详细信息')"
        @retry="handleTeamDetailRetry"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { QueryStateContainer } from "shared";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { getMemberTypeLabel, sortMembersByCaptain } from "@/components/team/utils";
import { useClientUserData, useTeamRoleSync } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import TeamBasicDetail from "./components/team-basic-detail/index.vue";
import styles from "./index.module.scss";

const router = useRouter();
const { t } = useI18n();
const { clientUserInfo } = useClientUserData();

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const { data: teamOverview, refetch: refetchOverview } = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW],
  queryFn: () => walkClientService.QueryTeamOverview()
});

useTeamRoleSync(teamOverview);

const {
  data: teamDetail,
  isLoading: isTeamDetailLoading,
  error: teamDetailError,
  refetch: refetchTeamDetail
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail()
});

const sortedMembers = computed(() => sortMembersByCaptain(teamOverview.value?.members ?? []));

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
