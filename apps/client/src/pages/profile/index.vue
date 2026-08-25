<template>
  <main :class="styles.page">
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
        <profile-header :name="userInfo.name" :tel="displayValue(userInfo.tel)" />

        <quota-summary
          :create-op="userInfo.create_op"
          :join-op="userInfo.join_op"
          @help="handleQuotaHelp"
        />

        <profile-info-list :items="profileInfoItems" />

        <van-button
          block
          type="primary"
          icon="edit"
          :class="styles.editButton"
          @click="handleNavigateEdit"
        >
          {{ t("修改信息") }}
        </van-button>
      </div>
    </error-empty>
  </main>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { ErrorEmpty } from "shared";
import { showDialog } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { CLIENT_USER_INFO_QUERY_OPTIONS, useClientUserData } from "@/composables";

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
  if (!info) {
    return [];
  }

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

function handleQuotaHelp() {
  return showDialog({
    confirmButtonText: t("确认"),
    message: t("剩余次数说明内容"),
    title: t("剩余次数说明")
  });
}
</script>
