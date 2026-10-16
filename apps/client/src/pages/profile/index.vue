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
        <profile-header :name="userInfo.name" :tel="displayValue(userInfo.tel)" />

        <van-notice-bar
          v-if="userInfo.role === 'unbind'"
          mode="link"
          left-icon="friends-o"
          :class="styles.noticeBar"
          :text="t('尚未加入团队')"
          @click="handleNavigateTeam"
        />

        <pass-code :user-id="userInfo.id" />

        <quota-summary :create-op="userInfo.create_op" :join-op="userInfo.join_op" />

        <profile-info-list :items="profileInfoItems" />

        <van-button
          block
          round
          plain
          type="primary"
          :class="styles.editButton"
          @click="handleNavigateEdit"
        >
          {{ t("修改信息") }}
        </van-button>
      </div>
    </query-state-container>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { QueryStateContainer } from "shared";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { CLIENT_USER_INFO_QUERY_OPTIONS, useClientUserData } from "@/composables";

import PassCode from "./components/pass-code/index.vue";
import ProfileHeader from "./components/profile-header/index.vue";
import ProfileInfoList from "./components/profile-info-list/index.vue";
import QuotaSummary from "./components/quota-summary/index.vue";
import styles from "./index.module.scss";
import type { ProfileInfoItem } from "./types";

const router = useRouter();
const { t } = useI18n();

const { clientUserInfo } = useClientUserData();
const {
  data: queriedUserInfo,
  error,
  isLoading,
  refetch
} = useQuery(CLIENT_USER_INFO_QUERY_OPTIONS);

const userInfo = computed(() => queriedUserInfo.value ?? clientUserInfo.value);

const profileInfoItems = computed<ProfileInfoItem[]>(() => {
  const info = userInfo.value;
  if (!info) return [];

  return [
    { label: t("姓名"), value: displayValue(info.name) },
    { label: t("学工号"), value: displayValue(info.stu_id) },
    { label: t("电话号码"), value: displayValue(info.tel) },
    { label: t("微信"), value: displayValue(info.wechat) },
    { label: t("QQ"), value: displayValue(info.qq) }
  ];
});

function displayValue(value: string) {
  return value.trim() || t("无");
}

function handleNavigateEdit() {
  return router.push({ name: "profile-edit" });
}

function handleNavigateTeam() {
  return router.push({ name: "team-info" });
}
</script>
