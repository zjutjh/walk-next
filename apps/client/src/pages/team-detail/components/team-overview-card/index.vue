<template>
  <van-cell-group inset title="基本信息" :class="styles.card">
    <template #title>
      <div :class="styles.sectionTitle">
        <van-icon name="notes-o" />
        <span>基本信息</span>
      </div>
    </template>

    <van-cell title="团队名称" :value="props.team.name" />
    <van-cell title="团队口号" :value="props.team.slogan || '暂无口号'" />
    <van-cell title="毅行路线" :value="routeLabel" />
    <van-cell title="查看团队详细信息" is-link clickable @click="handleDetailClick" />
  </van-cell-group>
</template>

<script setup lang="ts">
import type { TeamSummary } from "api/types/client";
import { computed } from "vue";

import { getRouteLabel } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  team: TeamSummary;
}>();

const emit = defineEmits<{
  detail: [];
}>();

const routeLabel = computed(() => getRouteLabel(props.team.route_name));

const handleDetailClick = () => {
  emit("detail");
};
</script>
