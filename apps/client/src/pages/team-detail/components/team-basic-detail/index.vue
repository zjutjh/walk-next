<template>
  <van-nav-bar title="基本信息" left-arrow @click-left="handleBackClick" />

  <section :class="styles.content">
    <van-cell-group inset :class="styles.card">
      <van-cell title="团队名称" :value="props.team.name" />
      <van-cell title="团队口号" :value="props.team.slogan || '暂无口号'" />
      <van-cell title="团队编号" :value="String(props.team.id)" />
      <van-cell title="团队密码" :value="props.team.password || '仅队长可见'" />
      <van-cell title="毅行路线" :value="routeLabel" />
      <van-cell title="是否提交">
        <template #value>
          <van-tag :type="props.team.submitted ? 'success' : 'danger'">
            {{ props.team.submitted ? "已提交" : "未提交" }}
          </van-tag>
        </template>
      </van-cell>
      <van-cell title="随机成员">
        <template #value>
          <van-tag type="success">{{ props.team.allow_match ? "是" : "否" }}</van-tag>
        </template>
      </van-cell>
      <van-cell title="团队性质" :value="props.team.type" />
      <van-cell title="队伍状态" :value="teamStatusLabel" />
      <van-cell title="当前位置" :value="props.team.latest_point_name || '未开始'" />
    </van-cell-group>

    <van-button v-if="props.canEdit" block round type="primary" @click="handleEditClick">
      修改信息
    </van-button>
  </section>
</template>

<script setup lang="ts">
import type { QueryTeamDetailResponse } from "api/types/client";
import { computed } from "vue";

import { getRouteLabel, getTeamStatusLabel } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  team: QueryTeamDetailResponse;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  back: [];
  edit: [];
}>();

const routeLabel = computed(() => getRouteLabel(props.team.route_name));

const teamStatusLabel = computed(() => getTeamStatusLabel(props.team.status));

const handleBackClick = () => {
  emit("back");
};

const handleEditClick = () => {
  emit("edit");
};
</script>
