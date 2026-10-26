<template>
  <div :class="styles.page">
    <query-state-container
      :error="error"
      :loading="isTeamDetailFetching"
      :data="teamDetail"
      :btn-text="t('重试')"
      :loading-text="t('refresh.loading')"
      :empty-description="t('暂无团队详细信息')"
      @retry="refetch"
    >
      <div v-if="teamDetail" :class="styles.content">
        <team-form
          :initial-value="initialFormValue"
          :loading="isTeamDetailFetching || isUpdateTeamInfoPending"
          :submitted="teamDetail.submitted"
          submit-label="更新信息"
          @submit="handleFormSubmit"
        />
      </div>
    </query-state-container>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { QueryStateContainer } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import TeamForm from "@/components/team-form/index.vue";
import type { TeamFormValue } from "@/components/team-form/types";
import { CLIENT_QUERY_KEY } from "@/constants";
import { getErrorMessage, walkClientService } from "@/utils";

import styles from "./index.module.scss";
import { buildInitialFormValue } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { t } = useI18n();

const {
  data: teamDetail,
  isFetching: isTeamDetailFetching,
  error,
  refetch
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail()
});

const initialFormValue = computed(() => buildInitialFormValue(teamDetail.value));

const { mutate: mutateUpdateTeamInfo, isPending: isUpdateTeamInfoPending } = useMutation({
  mutationFn: (value: TeamFormValue) =>
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
    showSuccessToast({ message: t("更新成功") });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW]
      }),
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL] })
    ]);

    router.replace({ name: "team-detail" });
  },
  onError: (updateError) => {
    showFailToast({ message: getErrorMessage(updateError, t("更新失败，请稍后重试")) });
  }
});

function handleFormSubmit(value: TeamFormValue) {
  if (isUpdateTeamInfoPending.value) return;
  mutateUpdateTeamInfo(value);
}
</script>
