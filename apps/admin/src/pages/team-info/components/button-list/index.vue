<!-- 团队信息页功能按钮列表 -->
<template>
  <div :class="styles.component">
    <van-button
      v-if="props.teamInfoData?.team?.is_prev_point_invalid && hasNotViolatedWalkingMember"
      type="danger"
      block
      @click="handleMarkViolatedClick"
      >标记团队违规</van-button
    >
    <van-button
      v-if="props.isStartPointManageAvailable"
      type="primary"
      block
      @click="handleBindCheckinCodeClick"
      >绑定签到码</van-button
    >
    <van-button
      v-if="isEndPointManageAvailable && hasInProgressMember"
      type="primary"
      block
      @click="handleConfirmDestinationClick"
      >确认到达终点</van-button
    >

    <!-- 扫码弹层 -->
    <qr-scan-popup
      v-model:show="isScanPopupVisible"
      :schema="CheckinQrCodeSchema"
      @success="handleScanSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { AdminAPI } from "api/types/admin";
import { is } from "valibot";
import { showConfirmDialog } from "vant";
import { computed, ref } from "vue";

import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { CheckinQrCodeSchema } from "@/utils";

import styles from "./index.module.scss";

const props = defineProps<{
  /** 团队ID */
  teamId: number;
  /** 团队信息 */
  teamInfoData: AdminAPI.QueryTeamStatusResponse | undefined;
  /** 起点管理功能是否可用 */
  isStartPointManageAvailable: boolean;
  /** 终点管理功能是否可用 */
  isEndPointManageAvailable: boolean;
}>();

const emit = defineEmits<{
  /** 标记团队违规 */
  mutateTeamViolated: [];
  /** 确认到达终点 */
  mutateConfirmDestination: [];
  /** 绑定签到码 */
  mutateBindCheckinCode: [params: { teamId: number; content: string }];
}>();

/** 团队中是否有未违规且未离开的成员 */
const hasNotViolatedWalkingMember = computed(() =>
  props.teamInfoData?.members.some(
    (member) =>
      !member.is_violated &&
      member.walk_status !== "abandoned" &&
      member.walk_status !== "withdrawn"
  )
);
/** 团队中是否有进行中成员 */
const hasInProgressMember = computed(() =>
  props.teamInfoData?.members.some((member) => member.walk_status === "in_progress")
);

/** 扫码弹层是否可见 */
const isScanPopupVisible = ref(false);
/** 点击绑定签到码 */
const handleBindCheckinCodeClick = () => {
  isScanPopupVisible.value = true;
};
/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (!is(CheckinQrCodeSchema, data)) return;
  // 关闭扫码弹层
  isScanPopupVisible.value = false;
  emit("mutateBindCheckinCode", {
    teamId: props.teamId,
    content: data.code
  });
};

/** 点击标记团队违规 */
const handleMarkViolatedClick = async () => {
  try {
    await showConfirmDialog({
      title: "团队违规",
      message: "确定将团队所有成员标记为已违规？",
      confirmButtonColor: "danger"
    });
  } catch {
    return;
  }
  emit("mutateTeamViolated");
};

/** 点击确认到达终点 */
const handleConfirmDestinationClick = async () => {
  try {
    await showConfirmDialog({
      message: "团队已完成毅行？"
    });
  } catch {
    return;
  }
  emit("mutateConfirmDestination");
};
</script>
