<template>
  <section :class="styles.teamList">
    <p :class="styles.countText">共找到{{ props.teams.length }}支队伍</p>

    <error-empty :error="props.error" :disabled="props.loading" @btn-click="handleRetryClick">
      <van-loading v-if="props.loading" :class="styles.loading" vertical>加载中</van-loading>

      <van-empty v-else-if="props.teams.length === 0" description="暂无可加入队伍" />

      <random-team-card
        v-for="team in props.teams"
        v-else
        :key="team.id"
        :team="team"
        :loading="props.joiningTeamId === team.id && props.joinLoading"
        @join="handleJoinClick"
      />
    </error-empty>
  </section>
</template>

<script setup lang="ts">
import { ErrorEmpty } from "shared";

import type { RandomJoinTeam } from "../../types";
import RandomTeamCard from "../random-team-card/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  teams: RandomJoinTeam[];
  loading: boolean;
  error: Error | null;
  joiningTeamId: number | undefined;
  joinLoading: boolean;
}>();

const emit = defineEmits<{
  join: [teamId: number];
  retry: [];
}>();

const handleJoinClick = (teamId: number) => {
  emit("join", teamId);
};

const handleRetryClick = () => {
  emit("retry");
};
</script>
