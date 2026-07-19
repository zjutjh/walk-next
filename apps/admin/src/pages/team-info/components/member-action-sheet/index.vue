<!-- 团队信息页成员操作弹层 -->
<template>
  <van-action-sheet
    v-model:show="isActionSheetVisible"
    :class="styles.component"
    :actions="memberActionSheetActions"
    :description="actionMember?.name"
    cancel-text="取消"
    close-on-click-action
  />
</template>

<script setup lang="ts">
import type { AdminAPI, MemberWalkStatus } from "api/types/admin";
import { find, isNil } from "lodash-es";
import type { ActionSheetAction } from "vant/es";
import { computed } from "vue";

import { MEMBER_WALK_STATUS_COLOR_MAP, MEMBER_WALK_STATUS_TEXT } from "@/constants";

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
  /** 更新成员行进状态 */
  mutateWalkStatus: [params: { memberId: number; status: MemberWalkStatus }];
  /** 更新成员违规状态 */
  mutateViolated: [params: { memberId: number; isViolated: boolean }];
}>();

/** 成员操作弹层是否可见 */
const isActionSheetVisible = defineModel<boolean>("visible", { required: true });
/** 成员操作弹层当前操作的成员ID */
const actionMemberId = defineModel<number | undefined>("memberId", { required: true });

/** 成员操作弹层当前操作的成员 */
const actionMember = computed(() =>
  find(props.teamInfoData?.members, (member) => member.user_id === actionMemberId.value)
);

/** 成员操作弹层的可用选项列表 */
const memberActionSheetActions = computed<ActionSheetAction[]>(() => {
  const availableStatusSet: Set<MemberWalkStatus> = new Set();

  // 用户为起点管理员，且起点相关功能适用于团队
  if (props.isStartPointManageAvailable) {
    availableStatusSet.add("not_start");
    availableStatusSet.add("pending");
  }

  // 任何情况下都可以选择进行中
  availableStatusSet.add("in_progress");

  // 用户为终点管理员，且终点相关功能适用于团队
  if (props.isEndPointManageAvailable) {
    availableStatusSet.add("completed");
  }

  // 团队上个打卡点位不为空，可选择已下撤
  if (props.teamInfoData?.team.prev_point_name) {
    availableStatusSet.add("withdrawn");
  }

  // 任何情况下都可以选择已放弃
  availableStatusSet.add("abandoned");

  /** 更改行进状态的选项列表 */
  const updateWalkStatusActions = Array.from(availableStatusSet).map(
    (status) =>
      ({
        name: MEMBER_WALK_STATUS_TEXT[status],
        disabled: status === actionMember.value?.walk_status,
        icon: status === actionMember.value?.walk_status ? "success" : undefined,
        color: MEMBER_WALK_STATUS_COLOR_MAP[status],
        callback: () => handleUpdateMemberWalkStatus(status)
      }) satisfies ActionSheetAction
  );

  /** 更改违规状态的选项 */
  const updateViolatedAction: ActionSheetAction = {
    name: actionMember.value?.is_violated ? "取消标记违规" : "标记违规",
    icon: actionMember.value?.is_violated ? "revoke" : "warning-o",
    color: actionMember.value?.is_violated ? "var(--van-warning-color)" : "var(--van-danger-color)",
    callback: () => handleUpdateMemberViolated(!actionMember.value?.is_violated)
  };

  return [...updateWalkStatusActions, updateViolatedAction];
});

/** 更改成员行进状态 */
const handleUpdateMemberWalkStatus = (targetStatus: MemberWalkStatus) => {
  if (isNil(actionMemberId.value)) return;
  emit("mutateWalkStatus", {
    memberId: actionMemberId.value,
    status: targetStatus
  });
};

/** 更改成员违规状态 */
const handleUpdateMemberViolated = (isViolated: boolean) => {
  if (isNil(actionMemberId.value)) return;
  emit("mutateViolated", {
    memberId: actionMemberId.value,
    isViolated
  });
};
</script>
