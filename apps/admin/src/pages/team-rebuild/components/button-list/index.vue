<!-- 团队重组页功能按钮列表 -->
<template>
  <div :class="styles.component">
    <van-button
      :disabled="isAddMemberButtonDisabled"
      :loading="props.isAddMemberPending"
      type="primary"
      block
      plain
      @click="handleAddMemberScanClick"
      >扫码添加</van-button
    >
    <van-button
      :disabled="isAddMemberButtonDisabled"
      :loading="props.isAddMemberPending"
      type="primary"
      block
      plain
      @click="handleAddMemberWithIdClick"
      >编号添加</van-button
    >
    <van-button
      type="primary"
      :loading="props.isRebuildTeamPending"
      :disabled="isSubmitButtonDisabled"
      block
      @click="handleSubmitClick"
      >提交团队</van-button
    >

    <!-- 人员ID输入弹窗 -->
    <prompt-dialog
      v-model:show="isMemberIdDialogVisible"
      v-model="memberIdDialogValue"
      title="编号添加"
      :field-config="MEMBER_ID_DIALOG_CONFIG"
      :submit-disabled="props.isAddMemberPending"
      @submit="handleMemberIdDialogSubmit"
      @cancel="handleMemberIdDialogCancel"
    />

    <!-- 扫码弹层 -->
    <qr-scan-popup
      v-model:show="isScanPopupVisible"
      :schema="MemberQrCodeSchema"
      @success="handleScanSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { TeamRebuildMember } from "api/types/admin";
import type { PromptDialogFieldConfig } from "shared";
import { PromptDialog } from "shared";
import { is } from "valibot";
import { showConfirmDialog, showFailToast } from "vant";
import { computed, ref } from "vue";

import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { MemberQrCodeSchema } from "@/utils";
import { type RouteId } from "@/walk-config";

import { TEAM_REBUILD_MEMBER_COUNT_LIMIT } from "../../constants";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 重组的团队的路线 */
  teamRoute: RouteId | "";
  /** 重组的团队的成员列表 */
  memberList: TeamRebuildMember[];
  /** 重组团队请求是否正在进行 */
  isRebuildTeamPending: boolean;
  /** 获取成员信息并添加成员到团队请求是否正在进行 */
  isAddMemberPending: boolean;
}>();

const emit = defineEmits<{
  /** 未选择路线时点击添加成员 */
  clickAddMemberWithRouteUnelected: [];
  /** 添加成员到团队 */
  mutateAddMember: [memberId: number];
  /** 取消添加成员 */
  cancelMutateAddMember: [];
  /** 提交重组的团队 */
  mutateRebuildTeam: [];
}>();

/** 重组的团队的成员ID列表 */
const memberIdList = defineModel<number[]>("memberIdList", { required: true });
/** 人员ID输入弹窗是否显示 */
const isMemberIdDialogVisible = defineModel<boolean>("isMemberIdDialogVisible", { required: true });
/** 人员ID输入弹窗 表单值 */
const memberIdDialogValue = defineModel<{ memberIdStr: string }>("memberIdDialogValue", {
  required: true
});

/** 添加新成员按钮是否禁用 */
const isAddMemberButtonDisabled = computed(
  () =>
    // 人数达上限
    memberIdList.value.length >= TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX
);

/** 提交团队按钮是否禁用 */
const isSubmitButtonDisabled = computed(
  () =>
    // 人数超限
    memberIdList.value.length < TEAM_REBUILD_MEMBER_COUNT_LIMIT.MIN ||
    memberIdList.value.length > TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX ||
    // 未选择路线
    !props.teamRoute ||
    // 正在请求
    props.isRebuildTeamPending
);

/** 人员ID输入弹窗 表单字段配置 */
const MEMBER_ID_DIALOG_CONFIG: Record<
  keyof typeof memberIdDialogValue.value,
  PromptDialogFieldConfig
> = {
  memberIdStr: {
    label: "人员ID",
    placeholder: "请输入毅行人员ID",
    type: "digit",
    rules: [
      { required: true, message: "请输入毅行人员ID" },
      // 查重验证
      {
        validator: (val) => !memberIdList.value.some((memberId) => memberId === parseInt(val)),
        message: "该成员已添加，不可重复添加"
      }
    ]
  }
};
/** 人员ID输入弹窗提交 */
const handleMemberIdDialogSubmit = () => {
  const userId = parseInt(memberIdDialogValue.value.memberIdStr);
  emit("mutateAddMember", userId);
};
/** 人员ID输入弹窗取消 */
const handleMemberIdDialogCancel = () => {
  emit("cancelMutateAddMember");
};

/** 点击编号添加 */
const handleAddMemberWithIdClick = () => {
  // 未选择路线
  if (!props.teamRoute) {
    emit("clickAddMemberWithRouteUnelected");
    return;
  }
  memberIdDialogValue.value.memberIdStr = "";
  isMemberIdDialogVisible.value = true;
};

/** 扫码弹层是否可见 */
const isScanPopupVisible = ref(false);
/** 点击扫码添加 */
const handleAddMemberScanClick = () => {
  // 未选择路线
  if (!props.teamRoute) {
    emit("clickAddMemberWithRouteUnelected");
    return;
  }
  isScanPopupVisible.value = true;
};
/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (!is(MemberQrCodeSchema, data)) return;
  // 关闭扫码弹层
  isScanPopupVisible.value = false;
  // 查重验证
  if (memberIdList.value.some((memberId) => memberId === data.user_id)) {
    showFailToast("该成员已添加\n不可重复添加");
    return;
  }
  emit("mutateAddMember", data.user_id);
};

/** 点击提交团队 */
const handleSubmitClick = async () => {
  try {
    await showConfirmDialog({
      title: "重组团队",
      message: "列表中的成员将移至新团队，\n是否确认？（操作不可撤销！）"
    });
  } catch {
    return;
  }
  emit("mutateRebuildTeam");
};
</script>
