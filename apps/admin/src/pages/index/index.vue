<template>
  <default-layout title="精弘毅行管理后台" :show-back="false">
    <admin-info :admin-name="authStore.adminName" :walk-point="authStore.pointText" />
    <section :class="styles.main">
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link @click="handleScanClick" />
        <van-cell title="输入签到" is-link @click="handleManualInputClick" />
      </van-cell-group>

      <van-cell-group title="数据大盘">
        <van-cell title="屏峰可视化地图" is-link />
        <van-cell title="莫干山可视化地图" is-link />
        <van-cell title="数据表格" is-link />
      </van-cell-group>

      <van-cell-group title="人员管理">
        <van-cell title="重组队伍" is-link to="/team-rebuild" />
        <div :class="styles.functionButtonContainer">
          <van-button type="primary" :class="styles.functionButton" block>
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
          @click="handleLogout"
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

    <team-id-input-modal
      v-model:show="isTeamIdModalVisible"
      :description="teamIdModalDescription"
      @submit="handleTeamIdSubmit"
      @cancel="handleTeamIdCancel"
    />

    <login-modal v-model:show="isLoginModalVisible" @success="handleLoginSuccess" />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { AdminAPI, QrCodeType } from "api/types/admin";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import LoginModal from "@/components/login-modal/index.vue";
import QrScanPreview from "@/components/qr-scan-preview/index.vue";
import TeamIdInputModal from "@/components/team-id-input-modal/index.vue";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { useAdminAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";
import { createCheckinHandlers, isStartOrEndPoint } from "./utils";

const router = useRouter();
const authStore = useAdminAuthStore();

const isLoginModalVisible = ref(!authStore.isLoggedIn);

const isScanPopupVisible = ref(false);
const isTeamIdModalVisible = ref(false);

const isTeamIdInputFromCheckin = ref(false);
const pendingTeamId = ref<number | null>(null);
const pendingCheckinCode = ref<string | null>(null);
const pendingTeamNeedsBind = ref(false);
const expectedScanType = ref<QrCodeType | null>(null);
const isProcessing = ref(false);

/** 判断管理员是否是起终点管理员 */
const isStartOrEndAdmin = computed(() => isStartOrEndPoint(authStore.point));

const teamIdModalDescription = computed(() =>
  pendingCheckinCode.value ? "已扫到签到码，请输入团队ID继续绑定。" : ""
);

const requestScan = (expectedType?: QrCodeType) => {
  expectedScanType.value = expectedType ?? null;
  isScanPopupVisible.value = true;
};

const openTeamIdInput = (fromCheckin: boolean) => {
  isTeamIdInputFromCheckin.value = fromCheckin;
  isTeamIdModalVisible.value = true;
};

const clearPendingState = () => {
  pendingTeamId.value = null;
  pendingCheckinCode.value = null;
  pendingTeamNeedsBind.value = false;
  expectedScanType.value = null;
};

const handleScanClick = () => {
  requestScan();
};

const {
  handleScanSuccess,
  handleScanError,
  handleManualInputClick,
  handleTeamIdSubmit,
  handleTeamIdCancel
} = createCheckinHandlers({
  router,
  getAuthPoint: () => authStore.point,
  isStartOrEndAdmin: () => isStartOrEndAdmin.value,
  pendingTeamId,
  pendingCheckinCode,
  pendingTeamNeedsBind,
  expectedScanType,
  isProcessing,
  isTeamIdInputFromCheckin,
  requestScan,
  openTeamIdInput,
  clearPendingState
});

const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
  mutationFn: () => walkAdminService.Logout(undefined),
  onSuccess: () => {
    authStore.clearAuth();
    clearPendingState();
    isScanPopupVisible.value = false;
    isTeamIdModalVisible.value = false;
    isLoginModalVisible.value = true;
    showSuccessToast("退出登录成功");
  },
  onError: (err: Error) => {
    showFailToast(err.message || "退出登录失败");
  }
});

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: "确认退出",
      message: "确定要退出当前账号吗？",
      confirmButtonText: "退出登录",
      cancelButtonText: "取消"
    });
    mutateLogout();
  } catch {
    // 用户取消了操作，不需要做任何处理
  }
};

const handleLoginSuccess = (data: AdminAPI.AuthResponse) => {
  authStore.saveLogin(data);
  isLoginModalVisible.value = false;
};
</script>
