<template>
  <section :class="styles.teamList">
    <p :class="styles.countText">{{ t("共找到{n}支队伍", { n: displayedTeams.length }) }}</p>

    <error-empty :error="props.error" :disabled="props.loading" @btn-click="emit('retry')">
      <loading-container
        :class="styles.loadingContainer"
        :loading="props.loading"
        :text="t('refresh.loading')"
      >
        <van-empty
          v-if="displayedTeams.length === 0 && !props.loading"
          :description="t('暂无可加入队伍')"
        />

        <!-- 换场分两段：旧卡播完飞出动画（class 驱动，卡片不脱离文档流），
             最后一张卡 animationend 后换上新列表，由 TransitionGroup 播飞入。
             不要让 TransitionGroup 直接处理整列表替换：飞出卡片 absolute 后
             静态位置塌陷，会全部堆叠到第一排 -->
        <transition-group
          v-else-if="displayedTeams.length > 0"
          appear
          tag="div"
          :class="styles.cardList"
          :enter-active-class="styles.cardEnterActive"
          :enter-from-class="styles.cardEnterFrom"
          :leave-active-class="styles.cardLeaveActive"
          :move-class="styles.cardMove"
        >
          <random-team-card
            v-for="(team, index) in displayedTeams"
            :key="team.id"
            :class="isFlyingOut ? styles.cardFlyOut : undefined"
            :style="{ '--card-index': `${index}` }"
            :team="team"
            :loading="props.joiningTeamId === team.id && props.joinLoading"
            @join="emit('join', $event)"
            @animationend="handleFlyOutEnd(index)"
          />
        </transition-group>
      </loading-container>
    </error-empty>
  </section>
</template>

<script setup lang="ts">
import { ErrorEmpty, LoadingContainer } from "shared";
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

/** 实际渲染的列表：切换筛选时先让旧卡片飞出，完毕后再换成新数据飞入 */
const displayedTeams = ref<RandomJoinTeam[]>([]);
/** 旧列表是否正在飞出 */
const isFlyingOut = ref(false);
/** 飞出期间到达的新数据，飞出结束后统一换上 */
let pendingTeams: RandomJoinTeam[] | undefined;

/** 两批队伍是否存在交集：有交集视为同一路线的数据刷新（原地更新，不播换场） */
const hasSharedTeam = (a: RandomJoinTeam[], b: RandomJoinTeam[]) => {
  const teamIds = new Set(b.map((team) => team.id));
  return a.some((team) => teamIds.has(team.id));
};

watch(
  () => props.teams,
  (teams) => {
    // 飞出进行中不打断：最新数据暂存，飞出结束统一换上
    if (isFlyingOut.value) {
      pendingTeams = teams;
      return;
    }

    // 首次填充或同一路线的刷新：原地更新
    if (displayedTeams.value.length === 0 || hasSharedTeam(displayedTeams.value, teams)) {
      displayedTeams.value = teams;
      return;
    }

    // 切换了筛选：旧卡先飞出，动画结束（handleFlyOutEnd）再换入新列表
    isFlyingOut.value = true;
    pendingTeams = teams;
  },
  { immediate: true }
);

/** 最后一张卡（延迟最长）飞出结束时换上新列表，触发飞入 */
const handleFlyOutEnd = (index: number) => {
  if (!isFlyingOut.value || index !== displayedTeams.value.length - 1) return;

  isFlyingOut.value = false;
  if (pendingTeams) {
    displayedTeams.value = pendingTeams;
    pendingTeams = undefined;
  }
};
</script>
