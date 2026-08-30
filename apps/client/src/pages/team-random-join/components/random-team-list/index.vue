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

let swapTimer: ReturnType<typeof setTimeout> | undefined;

const clearSwapTimer = () => {
  if (swapTimer !== undefined) {
    clearTimeout(swapTimer);
    swapTimer = undefined;
  }
};

/** 是否为同一批队伍（同路线后台重新拉取等场景），此时直接原地更新、不重播动画 */
const isSameTeamList = (a: RandomJoinTeam[], b: RandomJoinTeam[]) =>
  a.length === b.length && a.every((team, index) => team.id === b[index]?.id);

watch(
  () => props.teams,
  (teams) => {
    clearSwapTimer();
    isFlyingOut.value = false;

    // 首次加载或同一批数据：直接换上，新卡片随元素插入自动逐个飞入
    if (displayedTeams.value.length === 0 || isSameTeamList(displayedTeams.value, teams)) {
      displayedTeams.value = teams;
      return;
    }

    // 切换了列表：旧卡片逐个飞出，全部飞完后再换成新列表
    isFlyingOut.value = true;
    swapTimer = setTimeout(
      () => {
        isFlyingOut.value = false;
        displayedTeams.value = teams;
      },
      (displayedTeams.value.length - 1) * FLY_OUT_STAGGER_MS + FLY_OUT_DURATION_MS
    );
  },
  { immediate: true }
);

onBeforeUnmount(clearSwapTimer);
</script>
