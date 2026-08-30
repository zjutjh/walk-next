<template>
  <section :class="styles.teamList">
    <p :class="styles.countText">{{ t("共找到{n}支队伍", { n: displayedTeams.length }) }}</p>

    <error-empty :error="props.error" :disabled="props.loading" @btn-click="emit('retry')">
      <van-loading v-if="props.loading" :class="styles.loading" vertical>
        {{ t("refresh.loading") }}
      </van-loading>

      <van-empty v-else-if="displayedTeams.length === 0" :description="t('暂无可加入队伍')" />

      <random-team-card
        v-for="(team, index) in displayedTeams"
        v-else
        :key="team.id"
        :class="isFlyingOut ? styles.cardFlyOut : styles.flyInCard"
        :style="{
          '--enter-delay': `${index * ENTER_STAGGER_MS}ms`,
          '--leave-delay': `${index * FLY_OUT_STAGGER_MS}ms`
        }"
        :team="team"
        :loading="props.joiningTeamId === team.id && props.joinLoading"
        @join="emit('join', $event)"
      />
    </error-empty>
  </section>
</template>

<script setup lang="ts">
import { ErrorEmpty } from "shared";
import { onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import type { RandomJoinTeam } from "../../types";
import RandomTeamCard from "../random-team-card/index.vue";
import styles from "./index.module.scss";

/** 相邻卡片飞入的间隔 */
const ENTER_STAGGER_MS = 60;
/** 相邻卡片飞出的间隔，比飞入更快 */
const FLY_OUT_STAGGER_MS = 40;
/** 单张卡片飞出动画时长，需与样式文件中 card-fly-out 的 duration 保持一致 */
const FLY_OUT_DURATION_MS = 200;

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

const { t } = useI18n();

/** 实际渲染的列表：切换筛选时先让旧卡片飞出，完毕后再换成新数据飞入 */
const displayedTeams = ref<RandomJoinTeam[]>([]);
/** 旧列表是否正在飞出 */
const isFlyingOut = ref(false);
/** 换场动画期间暂存的新列表，飞出结束后统一换上 */
let pendingTeams: RandomJoinTeam[] | undefined;

let swapTimer: ReturnType<typeof setTimeout> | undefined;

const clearSwapTimer = () => {
  if (swapTimer !== undefined) {
    clearTimeout(swapTimer);
    swapTimer = undefined;
  }
};

/** 两批队伍是否存在交集：有交集说明是同一路线的数据刷新（原地修补、不重播动画），
 *  完全无交集才视作切换了筛选、需要播放换场动画 */
const hasSharedTeam = (a: RandomJoinTeam[], b: RandomJoinTeam[]) => {
  const teamIds = new Set(b.map((team) => team.id));
  return a.some((team) => teamIds.has(team.id));
};

watch(
  () => props.teams,
  (teams) => {
    // 飞出阶段不打断动画：属于新筛选的数据先暂存，飞完后统一换上；
    // 旧路线的残余更新（与旧列表有交集）直接丢弃，避免飞行中的卡片重播动画
    if (isFlyingOut.value) {
      if (!hasSharedTeam(displayedTeams.value, teams)) pendingTeams = teams;
      return;
    }

    // 首次加载或同一路线的数据刷新：直接原地更新，不播换场动画
    if (displayedTeams.value.length === 0 || hasSharedTeam(displayedTeams.value, teams)) {
      displayedTeams.value = teams;
      return;
    }

    // 切换了筛选：旧卡片逐个飞出，全部飞完后再换上新列表飞入
    isFlyingOut.value = true;
    pendingTeams = teams;
    swapTimer = setTimeout(
      () => {
        isFlyingOut.value = false;
        if (pendingTeams) {
          displayedTeams.value = pendingTeams;
          pendingTeams = undefined;
        }
      },
      (displayedTeams.value.length - 1) * FLY_OUT_STAGGER_MS + FLY_OUT_DURATION_MS
    );
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearSwapTimer();
  pendingTeams = undefined;
});
</script>
