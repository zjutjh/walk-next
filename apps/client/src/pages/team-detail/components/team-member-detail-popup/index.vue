<template>
  <van-popup
    :show="props.opened"
    position="bottom"
    round
    closeable
    :class="styles.popup"
    @click-close-icon="handleCloseClick"
    @click-overlay="handleCloseClick"
  >
    <section :class="styles.content">
      <h2 :class="styles.title">队员信息</h2>

      <error-empty :error="props.error" :disabled="props.loading" @btn-click="handleRetryClick">
        <van-loading v-if="props.loading" :class="styles.loading" vertical>加载中</van-loading>

        <van-cell-group v-else-if="props.member" inset>
          <van-cell title="姓名" :value="props.member.name" />
          <van-cell title="人员性质" :value="memberTypeLabel" />
          <van-cell title="队内身份" :value="memberRoleLabel" />
          <van-cell title="电话" :value="props.member.tel || '未填写'" />
          <van-cell title="微信" :value="props.member.wechat || '未填写'" />
          <van-cell title="QQ" :value="props.member.qq || '未填写'" />
          <van-cell title="状态" :value="getWalkStatusLabel(props.member.walk_status)" />
        </van-cell-group>

        <van-empty v-else description="暂无队员信息" />
      </error-empty>

      <div v-if="props.member" :class="styles.actionArea">
        <van-button
          v-if="props.canManageMember"
          block
          round
          type="danger"
          plain
          :loading="props.actionLoading"
          @click="handleRemoveClick"
        >
          删除队员
        </van-button>

        <van-button
          v-if="props.canManageMember"
          block
          round
          type="primary"
          plain
          :loading="props.actionLoading"
          @click="handleTransferClick"
        >
          移交队长
        </van-button>

        <van-button block round plain :disabled="props.actionLoading" @click="handleCloseClick">
          取消
        </van-button>
      </div>
    </section>
  </van-popup>
</template>

<script setup lang="ts">
import type { QueryTeamMemberResponse, UserSummary } from "api/types/client";
import { ErrorEmpty } from "shared";
import { computed } from "vue";

import { getMemberRoleLabel, getMemberTypeLabel, getWalkStatusLabel } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  opened: boolean;
  member: QueryTeamMemberResponse | undefined;
  memberSummary: UserSummary | undefined;
  loading: boolean;
  error: Error | null;
  canManageMember: boolean;
  actionLoading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  retry: [];
  remove: [memberId: number];
  transfer: [memberId: number];
}>();

const memberTypeLabel = computed(() => {
  if (!props.memberSummary) return "暂无";
  return getMemberTypeLabel(props.memberSummary.type);
});

const memberRoleLabel = computed(() => {
  if (!props.memberSummary) return "暂无";
  return getMemberRoleLabel(props.memberSummary.role);
});

const handleCloseClick = () => {
  emit("close");
};

const handleRetryClick = () => {
  emit("retry");
};

const handleRemoveClick = () => {
  if (!props.member) return;
  emit("remove", props.member.id);
};

const handleTransferClick = () => {
  if (!props.member) return;
  emit("transfer", props.member.id);
};
</script>
