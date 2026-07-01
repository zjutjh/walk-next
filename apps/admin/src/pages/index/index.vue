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
        <van-cell title="屏峰可视化地图" is-link />
        <van-cell title="莫干山可视化地图" is-link />
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

    <team-id-input-modal v-model:show="isTeamIdModalVisible" @submit="handleTeamIdSubmit" />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { type AdminAPI, QR_CODE } from "api/types/admin";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import QrScanPreview from "@/components/qr-scan-preview/index.vue";
import TeamIdInputModal from "@/components/team-id-input-modal/index.vue";
import type { QrCodeData } from "@/composables/use-qr-scanner";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";
import { POINT_CONFIG } from "@/walk-config";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";

const router = useRouter();
const authStore = useAuthStore();

const isScanPopupVisible = ref(false);
const isTeamIdModalVisible = ref(false);

const handleScanClick = () => {
  if (isCheckInPending.value) return;
  isScanPopupVisible.value = true;
};

const handleManualInputClick = () => {
  if (isCheckInPending.value) return;

  isTeamIdModalVisible.value = true;
};

// 登出
const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
  mutationFn: () => walkAdminService.Logout(undefined),
  onSuccess: () => {
    authStore.reset();
    isScanPopupVisible.value = false;
    isTeamIdModalVisible.value = false;
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

/** 手动输入团队ID */
const handleTeamIdSubmit = (teamId: number) => {
  mutateCheckin({ code_type: QR_CODE.Team, content: String(teamId) });
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
