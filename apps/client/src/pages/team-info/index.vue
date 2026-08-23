<template>
  <main v-if="!isUserInfoReady" :class="styles.loadingPage">
    <van-loading vertical>加载中</van-loading>
  </main>

  <unjoined-team-home v-else-if="isUnjoined" />
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useClientUserData } from "@/composables";

import UnjoinedTeamHome from "./components/unjoined-team/index.vue";
import styles from "./index.module.scss";

const { clientUserInfo } = useClientUserData();

const isUserInfoReady = computed(() => Boolean(clientUserInfo.value));

const isUnjoined = computed(() => clientUserInfo.value?.role === "unbind");
</script>
