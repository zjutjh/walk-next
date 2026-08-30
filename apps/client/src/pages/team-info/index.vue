<template>
  <div :class="styles.page">
    <div v-if="!isUserInfoReady" :class="styles.loadingPage">
      <van-loading vertical>{{ t("refresh.loading") }}</van-loading>
    </div>

    <unjoined-team-home v-else-if="isUnjoined" />
    <joined-team v-else-if="isJoined" />

    <div v-else :class="styles.placeholderPage">
      <van-empty :description="t('暂无团队状态')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useClientUserData } from "@/composables";

import JoinedTeam from "./components/joined-team/index.vue";
import UnjoinedTeamHome from "./components/unjoined-team/index.vue";
import styles from "./index.module.scss";

const { t } = useI18n();
const { clientUserInfo } = useClientUserData();

const isUserInfoReady = computed(() => Boolean(clientUserInfo.value));

const isUnjoined = computed(() => clientUserInfo.value?.role === "unbind");

const isJoined = computed(() => {
  const role = clientUserInfo.value?.role;
  return role === "member" || role === "captain";
});
</script>
