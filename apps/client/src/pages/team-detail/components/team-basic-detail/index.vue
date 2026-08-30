<template>
  <section :class="styles.content">
    <van-cell-group inset :class="styles.card">
      <van-cell :title="t('团队名称')" :value="props.team.name" />
      <van-cell :title="t('团队口号')" :value="props.team.slogan || t('暂无口号')" />
      <van-cell :title="t('团队编号')" :value="String(props.team.id)" />
      <van-cell :title="t('团队密码')" :value="props.team.password || t('仅队长可见')" />
      <van-cell :title="t('毅行路线')" :value="routeLabel" />
      <van-cell :title="t('是否提交')">
        <template #value>
          <van-tag :type="props.team.submitted ? 'success' : 'danger'">
            {{ props.team.submitted ? t("已提交") : t("未提交") }}
          </van-tag>
        </template>
      </van-cell>
      <van-cell :title="t('随机成员')">
        <template #value>
          <van-tag type="success">{{ props.team.allow_match ? t("是") : t("否") }}</van-tag>
        </template>
      </van-cell>
      <van-cell :title="t('团队性质')" :value="props.teamType" />
      <van-cell :title="t('队伍状态')" :value="teamStatusLabel" />
      <van-cell :title="t('当前位置')" :value="props.team.latest_point_name || t('未开始')" />
    </van-cell-group>

    <van-button v-if="props.canEdit" block round type="primary" @click="handleEditClick">
      {{ t("修改信息") }}
    </van-button>
  </section>
</template>

<script setup lang="ts">
import type { QueryTeamDetailResponse } from "api/types/client";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { getRouteLabel, getTeamStatusLabel } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  team: QueryTeamDetailResponse;
  teamType: string;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const { t } = useI18n();

const routeLabel = computed(() => t(getRouteLabel(props.team.route_name)));

const teamStatusLabel = computed(() => t(getTeamStatusLabel(props.team.status)));

const handleEditClick = () => {
  emit("edit");
};
</script>
