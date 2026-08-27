<template>
  <main :class="styles.page">
    <van-empty image="search" description="尚未加入团队" />

    <van-cell-group inset title="加入或创建队伍">
      <team-action-card
        v-for="action in TEAM_ACTIONS"
        :key="action.routeName"
        :title="action.title"
        :description="action.description"
        :icon="action.icon"
        @select="handleActionSelect(action.routeName)"
      />
    </van-cell-group>
  </main>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { useRouter } from "vue-router";

import IcOutlineGroupAdd from "~icons/ic/outline-group-add";
import IcOutlineLock from "~icons/ic/outline-lock";
import IcOutlineSearch from "~icons/ic/outline-search";

import TeamActionCard from "../team-action-card/index.vue";
import styles from "./index.module.scss";

type TeamActionRouteName = "team-password-join" | "team-random-join" | "team-create";

interface TeamAction {
  title: string;
  description: string;
  icon: Component;
  routeName: TeamActionRouteName;
}

const router = useRouter();

const TEAM_ACTIONS: TeamAction[] = [
  {
    title: "密码加入",
    description: "通过团队编号密码加入",
    icon: IcOutlineLock,
    routeName: "team-password-join"
  },
  {
    title: "随机加入",
    description: "随机匹配加入一个团队",
    icon: IcOutlineSearch,
    routeName: "team-random-join"
  },
  {
    title: "创建团队",
    description: "创建属于自己的团队",
    icon: IcOutlineGroupAdd,
    routeName: "team-create"
  }
];

const handleActionSelect = (routeName: TeamActionRouteName) => {
  router.replace({ name: routeName });
};
</script>
