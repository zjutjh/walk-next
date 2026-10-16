<template>
  <div :class="styles.page">
    <query-state-container
      :error="error"
      :loading="isLoading"
      :data="userInfo"
      :btn-text="t('重试')"
      :loading-text="t('refresh.loading')"
      :empty-description="t('暂无个人信息')"
      @retry="refetch"
    >
      <div v-if="userInfo" :class="styles.content">
        <profile-edit-form
          :initial-value="initialFormValue"
          :loading="isUpdatePending"
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

import { CLIENT_USER_INFO_QUERY_OPTIONS, useClientUserData } from "@/composables";
import { confirmAction, walkClientService } from "@/utils";

import ProfileEditForm from "./components/profile-edit-form/index.vue";
import styles from "./index.module.scss";
import type { ProfileEditFormValue } from "./types";
import { buildInitialFormValue, toUpdateUserInfoRequest } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { t } = useI18n();
const { clientUserInfo, refreshUserInfo } = useClientUserData(queryClient);
const {
  data: queriedUserInfo,
  error,
  isLoading,
  refetch
} = useQuery(CLIENT_USER_INFO_QUERY_OPTIONS);

const userInfo = computed(() => queriedUserInfo.value ?? clientUserInfo.value);
const initialFormValue = computed(() => buildInitialFormValue(userInfo.value));

const { isPending: isUpdatePending, mutateAsync: mutateUpdateUserInfo } = useMutation({
  mutationFn: (value: ProfileEditFormValue) =>
    walkClientService.UpdateUserInfo(toUpdateUserInfoRequest(value)),
  onError: (updateError) => {
    showFailToast({ message: updateError.message || t("更新失败") });
  }
});

function handleFormSubmit(value: ProfileEditFormValue) {
  if (isUpdatePending.value) return;

  void confirmAction({
    title: t("确认"),
    message: t("是否确认保存修改？"),
    action: () => mutateUpdateUserInfo(value),
    onSuccess: handleUpdateSuccess
  });
}

async function handleUpdateSuccess() {
  showSuccessToast({ message: t("更新成功") });
  await refreshUserInfo();
  return router.replace({ name: "profile" });
}
</script>
