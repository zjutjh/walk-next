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

    <team-id-input-modal v-model:show="isTeamIdModalVisible" @submit="handleTeamIdSubmit" />

    <login-modal v-model:show="isLoginModalVisible" @success="handleLoginSuccess" />

    <qr-scan-preview
      v-model:show="isScanPopupVisible"
      @success="handleScanSuccess"
      @error="handleScanError"
    />

    <team-id-input-modal v-model:show="isTeamIdModalVisible" @submit="handleTeamIdSubmit" />

    <login-modal v-model:show="isLoginModalVisible" @success="handleLoginSuccess" />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { AdminAPI } from "api/types/admin";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import LoginModal from "@/components/login-modal/index.vue";
import QrScanPreview from "@/components/qr-scan-preview/index.vue";
import TeamIdInputModal from "@/components/team-id-input-modal/index.vue";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils";
import { POINT_CONFIG } from "@/walk-config";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";
import { createCheckinHandlers } from "./utils";

const router = useRouter();
const authStore = useAuthStore();

const isLoginModalVisible = ref(!authStore.isLoggedIn);

const isScanPopupVisible = ref(false);
const isTeamIdModalVisible = ref(false);
const isProcessing = ref(false);

const requestScan = () => {
  isScanPopupVisible.value = true;
};

const handleScanClick = () => {
  requestScan();
};

const handleManualInputClick = () => {
  isTeamIdModalVisible.value = true;
};

const { handleScanSuccess, handleScanError, handleTeamIdSubmit } = createCheckinHandlers({
  router,
  getAuthPoint: () => authStore.pointId,
  isProcessing,
  requestScan
});

const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
  mutationFn: () => walkAdminService.Logout(undefined),
  onSuccess: () => {
    authStore.reset();
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
  // 保存身份信息
  authStore.adminName = data.name;
  authStore.pointId = data.point_name;
  authStore.isLoggedIn = true;
  // 关闭登录弹窗
  isLoginModalVisible.value = false;
};
</script>
