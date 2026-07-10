<!-- 团队重组页 -->
<template>
  <default-layout :class="styles.page">
    <van-cell-group inset>
      <van-cell
        :value="ROUTE_CONFIG[teamRoute]?.text ?? '请选择路线'"
        title="团队路线"
        is-link
        @click="openRoutePickerSheet"
      ></van-cell>
    </van-cell-group>
    <van-cell-group inset title="团队成员">
      <div v-if="isEmpty(memberList)" :class="styles.emptyText">点击下方按钮，添加成员</div>
      <van-cell
        v-for="member in memberList"
        :key="member.id"
        :title="member.name"
        is-link
        @click="openMemberActionSheet(member.id)"
      >
        <span :style="{ color: MEMBER_STATUS_COLOR_MAP[member.status] }">{{
          WALKER_STATUS_TEXT[member.status]
        }}</span>
      </van-cell>
    </van-cell-group>
    <div :class="styles.memberCountText">
      已添加 {{ memberList.length }} 人，提交需 {{ TEAM_REBUILD_MEMBER_COUNT_LIMIT.MIN }}-{{
        TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX
      }}
      人
    </div>

    <div :class="styles.middleWhiteSpace"></div>

    <div :class="styles.buttonContainer">
      <van-button
        :disabled="isAddMemberButtonDisabled"
        :loading="isAddMemberPending"
        type="primary"
        block
        plain
        @click="handleAddMemberScanClick"
        >扫码添加</van-button
      >
      <van-button
        :disabled="isAddMemberButtonDisabled"
        :loading="isAddMemberPending"
        type="primary"
        block
        plain
        @click="handleAddMemberWithIdClick"
        >编号添加</van-button
      >
      <van-button
        type="primary"
        :loading="isRebuildTeamPending"
        :disabled="isSubmitButtonDisabled"
        block
        @click="handleSubmitClick"
        >提交团队</van-button
      >
    </div>
  </default-layout>

  <!-- 路线选择弹层 -->
  <van-action-sheet
    v-model:show="isRoutePickerVisible"
    :actions="routePickerActions"
    cancel-text="取消"
    @select="handleSelectRoute"
  />

  <!-- 成员操作弹层 -->
  <van-action-sheet
    v-model:show="isMemberActionSheetVisible"
    :actions="memberActionSheetActions"
    :description="memberActionSheetMember?.name"
    cancel-text="取消"
  />

  <!-- 人员ID输入弹窗 -->
  <prompt-dialog
    v-model:show="isMemberIdDialogVisible"
    v-model="memberIdDialogValue"
    title="编号添加"
    :field-config="MEMBER_ID_DIALOG_CONFIG"
    :confirm-disabled="isAddMemberPending"
    @confirm="handleMemberIdDialogConfirm"
    @cancel="handleMemberIdDialogCancel"
  />

  <!-- 扫码弹窗 -->
  <qr-scan-popup
    v-model:show="isScanPopupVisible"
    :schema="MemberQrCodeSchema"
    @success="handleScanSuccess"
  />
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { TeamRebuildMember } from "api/types/admin";
import { CanceledError } from "axios";
import { find, isEmpty } from "lodash-es";
import { RequestError } from "shared";
import { is } from "valibot";
import { showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import type { PromptDialogFieldConfig } from "@/components/prompt-dialog/types";
import { WALKER_STATUS_TEXT } from "@/constants";
import { MEMBER_STATUS_COLOR_MAP } from "@/constants/member-status-config";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { MemberQrCodeSchema } from "@/utils";
import { walkAdminService } from "@/utils/service";
import { ROUTE_CONFIG, ROUTE_LIST, type RouteId } from "@/walk-config";

import { TEAM_REBUILD_MEMBER_COUNT_LIMIT } from "./constants";
import styles from "./index.module.scss";
import type { RoutePickerAction } from "./types";

const router = useRouter();

/** 重组的团队的成员列表 */
const memberList = ref<TeamRebuildMember[]>([]);
/** 重组的团队的路线 */
const teamRoute = ref<RouteId | "">("");

/** 提交团队按钮是否禁用 */
const isSubmitButtonDisabled = computed(
  () =>
    // 人数超限
    memberList.value.length < TEAM_REBUILD_MEMBER_COUNT_LIMIT.MIN ||
    memberList.value.length > TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX ||
    // 未选择路线
    !teamRoute.value ||
    // 正在请求
    isRebuildTeamPending.value
);

/** 添加新成员按钮是否禁用 */
const isAddMemberButtonDisabled = computed(
  () =>
    // 人数达上限
    memberList.value.length >= TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX
);

/** 人员ID输入弹窗确认 */
const handleMemberIdDialogConfirm = () => {
  const userId = Number(memberIdDialogValue.value.memberIdStr);
  mutateAddMember(userId);
};

/** 人员ID输入弹窗取消 */
const handleMemberIdDialogCancel = () => {
  addMemberAbortController?.abort();
};

/** 点击编号添加 */
const handleAddMemberWithIdClick = () => {
  memberIdDialogValue.value.memberIdStr = "";
  isMemberIdDialogVisible.value = true;
};

/** 扫码弹窗是否可见 */
const isScanPopupVisible = ref(false);

/** 点击扫码添加 */
const handleAddMemberScanClick = () => {
  isScanPopupVisible.value = true;
};

/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (!is(MemberQrCodeSchema, data)) return;
  isScanPopupVisible.value = false;
  // 查重验证
  if (memberList.value.some((member) => member.id === data.user_id)) {
    showFailToast("该成员已添加\n不可重复添加");
    return;
  }
  mutateAddMember(data.user_id);
};

/** 点击提交团队 */
const handleSubmitClick = () => {
  mutateRebuildTeam();
};

/** 路线选择弹层是否可见 */
const isRoutePickerVisible = ref(false);
/** 路线选择弹层选项列表 */
const routePickerActions: RoutePickerAction[] = ROUTE_LIST.map((routeId) => ({
  name: ROUTE_CONFIG[routeId].text,
  routeId: routeId
}));

/** 打开路线选择弹层 */
const openRoutePickerSheet = () => {
  isRoutePickerVisible.value = true;
};

/** 选择路线 */
const handleSelectRoute = (action: RoutePickerAction) => {
  teamRoute.value = action.routeId;
  isRoutePickerVisible.value = false;
};

/** 删除成员 */
const handleDeleteMember = () => {
  memberList.value = memberList.value.filter(
    (item) => Number(item.id) !== memberActionSheetMemberId.value
  );
  isMemberActionSheetVisible.value = false;
};

/** 成员操作弹层是否可见 */
const isMemberActionSheetVisible = ref(false);
/** 成员操作弹层选项列表 */
const memberActionSheetActions = [
  { name: "删除", color: "var(--van-danger-color)", callback: handleDeleteMember }
];
/** 成员操作弹层当前操作的成员ID */
const memberActionSheetMemberId = ref<number>();
/** 成员操作弹层当前操作的成员 */
const memberActionSheetMember = computed(() =>
  find(memberList.value, (member) => member.id === memberActionSheetMemberId.value)
);

/** 人员ID输入弹窗是否显示 */
const isMemberIdDialogVisible = ref(false);
/** 人员ID输入弹窗 表单值 */
const memberIdDialogValue = ref({ memberIdStr: "" });
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
        validator: (val) => !memberList.value.some((member) => member.id === Number(val)),
        message: "该成员已添加，不可重复添加"
      }
    ]
  }
};

/** 打开成员操作弹层 */
const openMemberActionSheet = (memberId: number) => {
  memberActionSheetMemberId.value = memberId;
  isMemberActionSheetVisible.value = true;
};

/** 获取成员信息并添加成员到团队 取消控制器 */
let addMemberAbortController: AbortController | null = null;
// 获取成员信息并添加成员到团队
const { mutate: mutateAddMember, isPending: isAddMemberPending } = useMutation({
  mutationFn: (userId: number) => {
    addMemberAbortController = new AbortController();
    return walkAdminService.QueryMemberInfo(
      {
        user_id: userId
      },
      { signal: addMemberAbortController.signal }
    );
  },
  onSuccess: (userInfo, userId) => {
    // 人员状态验证
    if (userInfo.status !== "not_start" && userInfo.status !== "pending") {
      showFailToast("须为未开始或待出发人员");
      return;
    }
    isMemberIdDialogVisible.value = false;
    memberList.value.push({
      id: userId,
      name: userInfo.name,
      status: userInfo.status
    });
    memberIdDialogValue.value.memberIdStr = "";
  },
  onError: (err) => {
    if (err instanceof RequestError && err.originError instanceof CanceledError) return;
    showFailToast(err instanceof Error ? err.message : "获取人员信息失败");
  }
});

// 重组团队
const { mutate: mutateRebuildTeam, isPending: isRebuildTeamPending } = useMutation({
  mutationFn: () =>
    walkAdminService.RebuildTeam({
      members: memberList.value.map((member) => member.id),
      route_name: teamRoute.value
    }),
  onSuccess: (res) => {
    memberList.value = [];
    teamRoute.value = "";
    showSuccessToast("重组成功");
    router.push({ path: `/team/${res.team_id}` });
  },
  onError: (err) => {
    showFailToast(err.message || "重组团队失败");
  }
});
</script>
