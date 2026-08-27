<template>
  <div :class="styles.page">
    <van-nav-bar
      :title="t('修改信息')"
      left-arrow
      :left-text="t('返回')"
      @click-left="handleBackClick"
    />

    <error-empty
      :error="userInfo ? undefined : error"
      :disabled="isLoading || Boolean(userInfo)"
      :btn-text="t('重试')"
      @btn-click="refetch"
    >
      <van-loading v-if="isLoading && !userInfo" vertical :class="styles.loading">
        {{ t("refresh.loading") }}
      </van-loading>

      <van-empty v-else-if="!userInfo" :description="t('暂无个人信息')" />

      <div v-else :class="styles.content">
        <profile-edit-form
          :initial-value="initialFormValue"
          :loading="isUpdatePending"
          @submit="handleFormSubmit"
        />
      </div>
    </error-empty>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ErrorEmpty } from "shared";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { CLIENT_USER_INFO_QUERY_OPTIONS, useClientUserData } from "@/composables";
import { walkClientService } from "@/utils";

import ProfileEditForm from "./components/profile-edit-form/index.vue";
import styles from "./index.module.scss";
import type { ProfileEditFormValue } from "./types";
import { buildInitialFormValue, toUpdateUserInfoRequest } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { t } = useI18n();
const { clientUserInfo, updateClientUserData } = useClientUserData(queryClient);
const {
  data: queriedUserInfo,
  error,
  isLoading,
  refetch
} = useQuery(CLIENT_USER_INFO_QUERY_OPTIONS);

const userInfo = computed(() => queriedUserInfo.value ?? clientUserInfo.value);
const initialFormValue = computed(() => buildInitialFormValue(userInfo.value));

const { isPending: isUpdatePending, mutate: mutateUpdateUserInfo } = useMutation({
  mutationFn: (value: ProfileEditFormValue) =>
    walkClientService.UpdateUserInfo(toUpdateUserInfoRequest(value)),
  onError: (updateError) => {
    showFailToast({ message: updateError.message || t("更新失败"), position: "top" });
  },
  onSuccess: handleUpdateSuccess
});

function handleBackClick() {
  router.back();
}

async function handleFormSubmit(value: ProfileEditFormValue) {
  if (isUpdatePending.value) {
    return;
  }

  await showConfirmDialog({
    cancelButtonText: t("取消"),
    confirmButtonText: t("确认"),
    message: t("是否确认保存修改？"),
    title: t("确认")
  });

  mutateUpdateUserInfo(value);
}

async function handleUpdateSuccess() {
  await queryClient.invalidateQueries({ queryKey: CLIENT_USER_INFO_QUERY_OPTIONS.queryKey });
  const refreshedUserInfo = await queryClient.fetchQuery(CLIENT_USER_INFO_QUERY_OPTIONS);
  updateClientUserData({ userInfo: refreshedUserInfo });

  showSuccessToast({ message: t("更新成功"), position: "top" });
  return router.replace({ name: "profile" });
}
</script>
