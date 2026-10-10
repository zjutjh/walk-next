<template>
  <div :class="styles.page">
    <error-empty
      :error="teamDetail ? undefined : error"
      :disabled="isLoading || Boolean(teamDetail)"
      :btn-text="t('重试')"
      @btn-click="refetch"
    >
      <loading-container
        :class="styles.loadingContainer"
        :loading="isLoading && !teamDetail"
        :text="t('refresh.loading')"
      >
        <van-empty v-if="!teamDetail && !isLoading" :description="t('暂无团队详细信息')" />

        <div v-else-if="teamDetail" :class="styles.content">
          <team-edit-form
            :initial-value="initialFormValue"
            :loading="isUpdateTeamInfoPending"
            @submit="handleFormSubmit"
          />
        </div>
      </loading-container>
    </error-empty>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ErrorEmpty, LoadingContainer } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import TeamEditForm from "./components/team-edit-form/index.vue";
import styles from "./index.module.scss";
import type { TeamEditFormValue } from "./types";
import { buildInitialFormValue } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { t } = useI18n();

const {
  data: teamDetail,
  isLoading,
  error,
  refetch
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail()
});

const initialFormValue = computed(() => buildInitialFormValue(teamDetail.value));

const { mutate: mutateUpdateTeamInfo, isPending: isUpdateTeamInfoPending } = useMutation({
  mutationFn: (value: TeamEditFormValue) =>
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
    showFailToast({ message: updateError.message || t("更新失败，请稍后重试") });
  }
});

function handleFormSubmit(value: TeamEditFormValue) {
  if (isUpdateTeamInfoPending.value) return;
  mutateUpdateTeamInfo(value);
}
</script>
