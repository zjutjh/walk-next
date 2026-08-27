<template>
  <main v-if="!isUserInfoReady" :class="styles.loadingPage">
    <van-loading vertical>加载中</van-loading>
  </main>

  <unjoined-team-home v-else-if="isUnjoined" />
  <joined-team v-else-if="isJoined" />

  <main v-else :class="styles.placeholderPage">
    <van-empty description="暂无团队状态" />
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useClientUserData } from "@/composables";

import JoinedTeam from "./components/joined-team/index.vue";
import UnjoinedTeamHome from "./components/unjoined-team/index.vue";
import styles from "./index.module.scss";

const { clientUserInfo } = useClientUserData();

const isUserInfoReady = computed(() => Boolean(clientUserInfo.value));

const isUnjoined = computed(() => clientUserInfo.value?.role === "unbind");

const isJoined = computed(() => {
  const role = clientUserInfo.value?.role;
  return role === "member" || role === "captain";
});
</script>
