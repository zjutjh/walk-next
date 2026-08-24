<template>
  <van-card
    :class="styles.teamCard"
    :title="props.team.name"
    :desc="props.team.slogan || '暂无口号'"
  >
    <template #tags>
      <van-tag round type="success">无需申请</van-tag>
    </template>

    <template #footer>
      <div :class="styles.footer">
        <span :class="styles.memberCount">{{
          t("{n}/{m} 人", { n: props.team.num, m: MAXIMUM_TEAM_SIZE })
        }}</span>
        <van-button
          round
          size="small"
          type="primary"
          :loading="props.loading"
          @click="handleJoinClick"
        >
          加入队伍
        </van-button>
      </div>
    </template>
  </van-card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { MAXIMUM_TEAM_SIZE } from "@/constants";

import type { RandomJoinTeam } from "../../types";
import styles from "./index.module.scss";
const props = defineProps<{
  team: RandomJoinTeam;
  loading: boolean;
}>();

const emit = defineEmits<{
  join: [teamId: number];
}>();

const { t } = useI18n();

const handleJoinClick = () => {
  emit("join", props.team.id);
};
</script>
