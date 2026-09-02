<template>
  <van-cell-group inset :class="styles.card">
    <template #title>
      <div :class="styles.sectionTitle">
        <van-icon name="friends-o" />
        <span>{{ t("队员信息") }}</span>
      </div>
    </template>

    <van-empty v-if="props.members.length === 0" :description="t('暂无队员信息')" />

    <van-cell
      v-for="member in props.members"
      v-else
      :key="member.id"
      :title="member.name"
      clickable
      is-link
      center
      @click="handleMemberClick(member.id)"
    >
      <template #label>
        <van-space :class="styles.tags" wrap>
          <van-tag plain type="primary">{{ t(getMemberTypeLabel(member.type)) }}</van-tag>
          <van-tag :type="member.role === 'captain' ? 'success' : 'default'">
            {{ t(getMemberRoleLabel(member.role)) }}
          </van-tag>
        </van-space>
      </template>
    </van-cell>
  </van-cell-group>
</template>

<script setup lang="ts">
import type { UserSummary } from "api/types/client";
import { useI18n } from "vue-i18n";

import { getMemberRoleLabel, getMemberTypeLabel } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  members: UserSummary[];
}>();

const emit = defineEmits<{
  memberClick: [memberId: number];
}>();

const { t } = useI18n();

const handleMemberClick = (memberId: number) => {
  emit("memberClick", memberId);
};
</script>
