<!-- 首页 -->
<template>
  <default-layout
    :class="styles.page"
    :loading="isAnyMutationPending"
    :show-back="false"
    title="精弘毅行管理后台"
  >
    <!-- 管理员信息卡片 -->
    <admin-info-card
      :admin-name="adminName || '-'"
      :walk-point="POINT_CONFIG[adminPointId]?.text ?? '-'"
    />

    <!-- 打卡 -->
    <van-cell-group title="签到">
      <van-cell title="扫码签到" is-link @click="handleScanClick" />
      <van-cell title="输入签到" is-link @click="handleManualInputClick" />
    </van-cell-group>

    <!-- 数据大盘 -->
    <van-cell-group v-if="hasPermission('internal')" title="数据大盘">
      <van-cell
        v-for="campusId in CAMPUS_LIST"
        :key="campusId"
        :title="`${CAMPUS_CONFIG[campusId].text}可视化地图`"
        :to="`/dashboard/${campusId}`"
        is-link
      />
      <van-cell title="数据表格" is-link to="/data-table" />
    </van-cell-group>

    <!-- 重组队伍 -->
    <van-cell-group v-if="hasPermission('super')" title="人员管理">
      <van-cell title="重组团队" is-link to="/team-rebuild" />
    </van-cell-group>

    <!-- 功能按钮列表 -->
    <div :class="styles.buttonContainer">
      <van-button
        v-if="hasPermission('super')"
        :class="styles.functionButton"
        :loading="isStartAllThePendingPending"
        type="primary"
        block
        @click="handleStartAllThePendingClick"
      >
        待出发→进行中
      </van-button>
      <van-button
        :loading="isLogoutPending"
        :disabled="isLogoutPending"
        type="danger"
        plain
        block
        @click="handleLogoutClick"
      >
        退出登录
      </van-button>
    </div>

    <!-- 扫码弹层 -->
    <qr-scan-popup
      v-model:show="urlQuery.isScanning"
      :loading="isCheckinPending || isNavigationPending"
      :schema="checkinQrCodeSchema"
      @success="handleScanSuccess"
    />

    <!-- 团队ID输入弹窗 -->
    <prompt-dialog
      v-model:show="isTeamIdDialogVisible"
      v-model="teamIdDialogValue"
      title="输入签到"
      :field-config="TEAM_ID_DIALOG_CONFIG"
      :submit-disabled="isCheckinPending"
      @submit="handleTeamIdDialogSubmit"
      @cancel="cancelMutateCheckin"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useArraySome } from "@vueuse/core";
import type { AdminAPI } from "api/types/admin";
import { CanceledError } from "axios";
import type { PromptDialogFieldConfig } from "shared";
import { PromptDialog, RequestError, useRouterState, useStoredUrlQuery } from "shared";
import { is } from "valibot";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { useAdminInfo } from "@/composables";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CheckinQrCodeSchema, TeamQrCodeSchema, walkAdminService } from "@/utils";
import { CAMPUS_CONFIG, CAMPUS_LIST, POINT_CONFIG } from "@/walk-config";

import AdminInfoCard from "./components/admin-info-card/index.vue";
import styles from "./index.module.scss";
import type { IndexUrlQuery } from "./types";
import { checkinQrCodeSchema } from "./utils";

const router = useRouter();
const queryClient = useQueryClient();
const { isNavigationPending } = useRouterState();
const { adminName, adminPointId, resetAdminInfo, hasPermission } = useAdminInfo();

const { urlQuery } = useStoredUrlQuery<IndexUrlQuery>({
  defaultValue: {
    isScanning: false
  }
});

/** 团队ID输入弹窗 表单值 */
const teamIdDialogValue = ref({ teamIdStr: "" });
/** 团队ID输入弹窗 表单字段配置 */
const TEAM_ID_DIALOG_CONFIG: Record<keyof typeof teamIdDialogValue.value, PromptDialogFieldConfig> =
  {
    teamIdStr: {
      label: "团队ID",
      placeholder: "请输入团队ID",
      type: "digit",
      rules: [{ required: true, message: "请输入团队ID" }]
    }
  };

/** 团队ID输入弹窗是否显示 */
const isTeamIdDialogVisible = ref(false);

/** 点击扫码签到按钮 */
const handleScanClick = () => {
  if (isCheckinPending.value) {
    showFailToast("正在打卡\n请稍后再试");
    return;
  }
  urlQuery.value.isScanning = true;
};

/** 点击输入签到按钮 */
const handleManualInputClick = () => {
  teamIdDialogValue.value = { teamIdStr: "" };
  isTeamIdDialogVisible.value = true;
};

// 登出
const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
  mutationFn: () => walkAdminService.Logout(undefined),
  onSuccess: () => {
    resetAdminInfo();
    urlQuery.value.isScanning = false;
    isTeamIdDialogVisible.value = false;
    showSuccessToast("登出成功");
    // 清空所有缓存
    queryClient.clear();
    // 跳转登录页
    router.push({ name: "login" });
  },
  onError: (err: Error) => {
    showFailToast(err.message || "登出失败");
  }
});

/** 打卡 取消控制器 */
let checkinAbortController: AbortController | null = null;
/** 取消打卡请求 */
const cancelMutateCheckin = () => {
  checkinAbortController?.abort();
};
// 打卡
const { mutate: mutateCheckin, isPending: isCheckinPending } = useMutation({
  mutationFn: (params: AdminAPI.CheckinTeamRequest) => {
    cancelMutateCheckin();
    checkinAbortController = new AbortController();
    return walkAdminService.CheckinTeam(params, { signal: checkinAbortController.signal });
  },
  onSuccess: (data) => {
    isTeamIdDialogVisible.value = false;
    switch (data.exception) {
      case "duplicate":
        showFailToast("团队重复打卡");
        break;
      case "wrong_direction":
        showFailToast("团队行进方向错误");
        break;
      case "":
        showSuccessToast("打卡成功");
        break;
      default:
        showFailToast("状态异常");
    }
    router.push({ name: "team-info", params: { teamIdParam: data.team_id } });
  },
  onError: (err) => {
    if (err instanceof RequestError && err.originError instanceof CanceledError) return;
    showFailToast(err.message || "打卡失败");
  }
});

// 将所有待出发改为进行中
const { mutate: mutateStartAllThePending, isPending: isStartAllThePendingPending } = useMutation({
  mutationFn: () => walkAdminService.StartAllThePending(undefined),
  onSuccess: () => {
    showSuccessToast("操作成功");
  },
  onError: (err: Error) => {
    showFailToast(err.message || "操作失败");
  }
});

/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (is(TeamQrCodeSchema, data)) {
    mutateCheckin({ code_type: "team", content: String(data.team_id) });
  } else if (is(CheckinQrCodeSchema, data)) {
    mutateCheckin({ code_type: "checkin", content: data.code });
  }
};

/** 团队ID输入弹窗提交 */
const handleTeamIdDialogSubmit = () => {
  mutateCheckin({ code_type: "team", content: teamIdDialogValue.value.teamIdStr });
};

/** 点击登出按钮 */
const handleLogoutClick = async () => {
  try {
    await showConfirmDialog({
      title: "退出登录",
      message: "确定要退出当前账号吗？",
      confirmButtonText: "登出"
    });
  } catch {
    return;
  }
  mutateLogout();
};

/** 点击待出发改为进行中按钮 */
const handleStartAllThePendingClick = async () => {
  try {
    await showConfirmDialog({
      title: "起点放行",
      message: "所有「待出发」人员将变为「进行中」，\n是否确认？（操作不可撤销！）"
    });
  } catch {
    return;
  }
  mutateStartAllThePending();
};

/** 任意mutation请求中 */
const isAnyMutationPending = useArraySome(
  [isLogoutPending, isCheckinPending, isStartAllThePendingPending],
  Boolean
);
</script>
