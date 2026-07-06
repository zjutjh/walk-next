<template>
  <default-layout :show-back="false">
    <admin-info
      :admin-name="authStore.adminName || '-'"
      :walk-point="POINT_CONFIG[authStore.pointId]?.text ?? '-'"
    />
    <section :class="styles.main">
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link @click="handleScanClick" />
        <van-cell title="输入签到" is-link @click="handleManualInputClick" />
      </van-cell-group>

      <van-cell-group title="数据大盘">
        <van-cell
          v-for="campusId in CAMPUS_LIST"
          :key="campusId"
          :title="`${CAMPUS_CONFIG[campusId].text}可视化地图`"
          :to="`/dashboard/${campusId}`"
          is-link
        />
        <van-cell title="数据表格" is-link to="/data-table" />
      </van-cell-group>

      <van-cell-group title="人员管理">
        <van-cell title="重组团队" is-link to="/team-rebuild" />
        <div :class="styles.functionButtonContainer">
          <van-button
            type="primary"
            :class="styles.functionButton"
            :loading="isStartAllThePendingPending"
            block
            @click="handleStartAllThePendingClick"
          >
            待出发→进行中
          </van-button>
        </div>
      </van-cell-group>

      <div :class="styles.logoutButtonContainer">
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
    </section>

    <qr-scan-preview
      v-model:show="isScanPopupVisible"
      @success="handleScanSuccess"
      @error="handleScanError"
    />

    <prompt-dialog
      v-model:show="isTeamIdDialogVisible"
      title="输入签到"
      :model-value="teamIdDialogValue"
      :field-config="TEAM_ID_DIALOG_CONFIG"
      @confirm="handleTeamIdConfirm"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { type AdminAPI, QR_CODE } from "api/types/admin";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import PromptDialog from "@/components/prompt-dialog/index.vue";
import type { PromptDialogFieldConfig } from "@/components/prompt-dialog/types.ts";
import QrScanPreview from "@/components/qr-scan-preview/index.vue";
import type { QrCodeData } from "@/composables/use-qr-scanner";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";
import { CAMPUS_CONFIG, CAMPUS_LIST, POINT_CONFIG } from "@/walk-config";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";

const router = useRouter();
const authStore = useAuthStore();

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

/** 扫码弹层是否显示 */
const isScanPopupVisible = ref(false);
/** 团队ID输入弹窗是否显示 */
const isTeamIdDialogVisible = ref(false);

/** 点击扫码签到按钮 */
const handleScanClick = () => {
  if (isCheckInPending.value) return;
  isScanPopupVisible.value = true;
};

/** 点击输入签到按钮 */
const handleManualInputClick = () => {
  if (isCheckInPending.value) return;
  teamIdDialogValue.value = { teamIdStr: "" };
  isTeamIdDialogVisible.value = true;
};

// 登出
const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
  mutationFn: () => walkAdminService.Logout(undefined),
  onSuccess: () => {
    authStore.reset();
    isScanPopupVisible.value = false;
    isTeamIdDialogVisible.value = false;
    showSuccessToast("登出成功");
  },
  onError: (err: Error) => {
    showFailToast(err.message || "登出失败");
  }
});

// 打卡
const { mutate: mutateCheckin, isPending: isCheckInPending } = useMutation({
  mutationFn: (params: AdminAPI.CheckinTeamRequest) => walkAdminService.CheckinTeam(params),
  onSuccess: (data) => {
    router.push({ path: `/team/${data.team_id}` });
  },
  onError: (err) => {
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
const handleScanSuccess = (data: QrCodeData) => {
  mutateCheckin(data);
};

/** 扫码失败 */
const handleScanError = (message: string) => {
  showFailToast(message || "扫码失败");
};

/** 团队ID输入弹窗确认 */
const handleTeamIdConfirm = () => {
  mutateCheckin({ code_type: QR_CODE.Team, content: teamIdDialogValue.value.teamIdStr });
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
</script>
