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
      <h2 :class="styles.title">{{ t("队员信息") }}</h2>

      <error-empty :error="props.error" :disabled="props.loading" @btn-click="handleRetryClick">
        <loading-container
          :class="styles.loadingContainer"
          :loading="props.loading"
          :text="t('refresh.loading')"
        >
          <van-cell-group v-if="props.member && !props.loading" inset>
            <van-cell :title="t('姓名')" :value="props.member.name" />
            <van-cell :title="t('人员性质')" :value="memberTypeLabel" />
            <van-cell :title="t('队内身份')" :value="memberRoleLabel" />
            <van-cell :title="t('电话')" :value="props.member.tel || t('未填写')" />
            <van-cell :title="t('微信')" :value="props.member.wechat || t('未填写')" />
            <van-cell :title="t('QQ')" :value="props.member.qq || t('未填写')" />
            <van-cell :title="t('状态')" :value="walkStatusLabel" />
          </van-cell-group>

          <van-empty v-else-if="!props.loading" :description="t('暂无队员信息')" />
        </loading-container>
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
          {{ t("删除队员") }}
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
          {{ t("移交队长") }}
        </van-button>

        <van-button block round plain :disabled="props.actionLoading" @click="handleCloseClick">
          {{ t("取消") }}
        </van-button>
      </div>
    </section>
  </van-popup>
</template>

<script setup lang="ts">
import type { QueryTeamMemberResponse, UserSummary } from "api/types/client";
import { ErrorEmpty, LoadingContainer } from "shared";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

const memberTypeLabel = computed(() => {
  if (!props.memberSummary) return t("暂无");
  return t(getMemberTypeLabel(props.memberSummary.type));
});

const memberRoleLabel = computed(() => {
  if (!props.memberSummary) return t("暂无");
  return t(getMemberRoleLabel(props.memberSummary.role));
});

const walkStatusLabel = computed(() =>
  props.member ? t(getWalkStatusLabel(props.member.walk_status)) : ""
);

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
