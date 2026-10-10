<template>
  <section :class="styles.card">
    <h1 :class="styles.teamName">{{ props.team.name }}</h1>

    <div :class="styles.divider" />

    <p :class="styles.slogan">{{ props.team.slogan || $t("暂无口号") }}</p>
    <p :class="styles.invitation">
      {{ $t("队长{name}邀请您加入", { name: props.team.captain_name }) }}
    </p>

    <div :class="styles.badges">
      <div :class="styles.badge">
        <span :class="styles.badgeValue">{{ memberText }}</span>
        <span :class="styles.badgeLabel">{{ $t("团队人数") }}</span>
      </div>
      <div v-if="phaseTitle" :class="styles.badge">
        <span :class="styles.badgeValue">{{ phaseTitle }}</span>
        <span :class="styles.badgeLabel">{{ $t("当前阶段") }}</span>
      </div>
      <div :class="styles.badge">
        <span :class="styles.badgeValue">{{ $t(routeLabel) }}</span>
        <span :class="styles.badgeLabel">{{ $t("报名路线") }}</span>
      </div>
    </div>

    <slot />
  </section>
</template>

<script setup lang="ts">
import type { QueryTeamBasicInfoResponse } from "api/types/client";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { INACTIVE_WALK_STAGE, WALK_STAGES } from "@/constants/walk-progress";
import { getRouteLabel } from "@/pages/team-detail/utils";

import styles from "./index.module.scss";

const { t } = useI18n();

const props = defineProps<{
  team: QueryTeamBasicInfoResponse;
}>();

const routeLabel = computed(() => getRouteLabel(props.team.route_name));

const memberText = computed(() => {
  const memberCount = props.team.member_count;
  const maxMemberCount = props.team.max_member_count;
  if (memberCount !== null && maxMemberCount !== null) {
    return t("{n}/{m} 人", { n: memberCount, m: maxMemberCount });
  }
  return props.team.is_full ? t("已满") : t("未满");
});

const phaseTitle = computed(() => {
  const phase = props.team.phase;
  if (phase === null) return undefined;
  return WALK_STAGES.find((stage) => stage.phase === phase)?.title ?? INACTIVE_WALK_STAGE.title;
});
</script>
