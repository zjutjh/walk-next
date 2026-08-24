<template>
  <main v-if="!isUserInfoReady || isJoined" :class="styles.loadingPage">
    <van-loading vertical>{{ isJoined ? "跳转中" : "加载中" }}</van-loading>
  </main>

  <unjoined-team-home v-else-if="isUnjoined" />
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";

import UnjoinedTeamHome from "./components/unjoined-team/index.vue";
import styles from "./index.module.scss";

const { clientUserInfo } = useClientUserData();
const router = useRouter();

const isUserInfoReady = computed(() => Boolean(clientUserInfo.value));

const isUnjoined = computed(() => clientUserInfo.value?.role === "unbind");

const isJoined = computed(() => {
  const role = clientUserInfo.value?.role;
  return role === "member" || role === "captain";
});

watch(
  isJoined,
  (shouldRedirect) => {
    if (!shouldRedirect) return;
    void router.replace({ name: "team-detail" });
  },
  { immediate: true }
);
</script>
