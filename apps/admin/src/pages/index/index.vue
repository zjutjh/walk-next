<template>
  <default-layout :class="styles.page" :show-back="false" title="精弘毅行管理后台">
    <loading-container :loading="isAnyMutationPending">
      <admin-info
        :admin-name="adminName || '-'"
        :walk-point="POINT_CONFIG[adminPointId]?.text ?? '-'"
      />
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link @click="handleScanClick" />
        <van-cell title="输入签到" is-link @click="handleManualInputClick" />
      </van-cell-group>

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

      <van-cell-group v-if="hasPermission('super')" title="人员管理">
        <van-cell title="重组团队" is-link to="/team-rebuild" />
      </van-cell-group>

      <div :class="styles.buttonContainer">
        <van-button
          v-if="hasPermission('super')"
          type="primary"
          :class="styles.functionButton"
          :loading="isStartAllThePendingPending"
          block
          @click="handleStartAllThePendingClick"
        >
          待出发→进行中
        </van-button>
        <van-button
          type="danger"
          plain
          block
          :loading="isLogoutPending"
          :disabled="isLogoutPending"
          @click="handleLogoutClick"
        >
          退出登录
        </van-button>
      </div>
    </loading-container>
  </default-layout>

  <qr-scan-popup
    v-model:show="urlQuery.isScanning"
    :loading="isCheckInPending"
    :schema="qrCodeSchema"
    @success="handleScanSuccess"
  />

  <prompt-dialog
    v-model:show="isTeamIdDialogVisible"
    v-model="teamIdDialogValue"
    title="输入签到"
    :field-config="TEAM_ID_DIALOG_CONFIG"
    :confirm-disabled="isCheckInPending"
    @confirm="handleTeamIdDialogConfirm"
    @cancel="handleTeamIdDialogCancel"
  />
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { type AdminAPI, AdminQrCodeType } from "api/types/admin";
import { CanceledError } from "axios";
import { RequestError } from "shared";
import { is, variant } from "valibot";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import LoadingContainer from "@/components/loading-container/index.vue";
import PromptDialog from "@/components/prompt-dialog/index.vue";
import type { PromptDialogFieldConfig } from "@/components/prompt-dialog/types.ts";
import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { useAdminInfo } from "@/composables/admin-user-info";
import { useStoredUrlQuery } from "@/composables/stored-url-query.ts";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CheckinQrCodeSchema, TeamQrCodeSchema, walkAdminService } from "@/utils";
import { CAMPUS_CONFIG, CAMPUS_LIST, POINT_CONFIG } from "@/walk-config";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";
import type { IndexUrlQuery } from "./types.ts";

const router = useRouter();
const { adminName, adminPointId, resetAdminInfo } = useAdminInfo();
const { hasPermission } = useAdminInfo();

const { urlQuery } = useStoredUrlQuery<IndexUrlQuery>({
  initialValue: {
    isScanning: false
  }
});

const qrCodeSchema = variant(
  "type",
  [TeamQrCodeSchema, CheckinQrCodeSchema],
  "类型错误\n请扫团队码\n或签到码"
);

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
  if (isCheckInPending.value) {
    showFailToast("正在打卡，请稍后再试");
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
    // 跳转登录页
    router.push({ name: "login" });
  },
  onError: (err: Error) => {
    showFailToast(err.message || "登出失败");
  }
});

/** 打卡 取消控制器 */
let checkinAbortController: AbortController | null = null;
// 打卡
const { mutate: mutateCheckin, isPending: isCheckInPending } = useMutation({
  mutationFn: (params: AdminAPI.CheckinTeamRequest) => {
    checkinAbortController = new AbortController();
    return walkAdminService.CheckinTeam(params, { signal: checkinAbortController.signal });
  },
  onSuccess: (data) => {
    isTeamIdDialogVisible.value = false;
    if (data.is_duplicate_check_in) {
      showFailToast("团队重复打卡");
    } else {
      showSuccessToast("打卡成功");
    }
    router.push({ path: `/team/${data.team_id}` });
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
    mutateCheckin({ code_type: AdminQrCodeType.Team, content: String(data.team_id) });
  } else if (is(CheckinQrCodeSchema, data)) {
    mutateCheckin({ code_type: AdminQrCodeType.Checkin, content: data.code });
  }
};

/** 团队ID输入弹窗确认 */
const handleTeamIdDialogConfirm = () => {
  mutateCheckin({ code_type: AdminQrCodeType.Team, content: teamIdDialogValue.value.teamIdStr });
};

/** 团队ID输入弹窗取消 */
const handleTeamIdDialogCancel = () => {
  checkinAbortController?.abort();
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
const isAnyMutationPending = computed(
  () => isLogoutPending.value || isCheckInPending.value || isStartAllThePendingPending.value
);
</script>
