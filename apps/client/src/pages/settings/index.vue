<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-cell title="反馈" clickable is-link :url="FEEDBACK_QA_URL" />
      <van-cell title="退出登录" clickable is-link @click="handleLogoutClick" />
    </van-cell-group>
  </div>

  <van-dialog
    v-model:show="isLogoutDialogVisible"
    :show-confirm-button="false"
    :class="styles.logoutDialog"
    teleport="body"
  >
    <div :class="styles.logoutDialogContent">
      <img
        :class="styles.logoutDialogImage"
        src="@/assets/images/programmer.png"
        alt=""
        aria-hidden="true"
      />
      <p :class="styles.logoutDialogMessage">是否确认退出？</p>
      <div :class="styles.logoutDialogFooter">
        <van-button :class="styles.logoutDialogCancel" size="small" @click="handleLogoutConfirm">
          确认
        </van-button>
        <van-button
          :class="styles.logoutDialogConfirm"
          type="primary"
          size="small"
          @click="handleLogoutCancel"
        >
          再想想
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";

import styles from "./index.module.scss";

const router = useRouter();
const { resetClientUserData } = useClientUserData();

const FEEDBACK_QA_URL = import.meta.env.VITE_FEEDBACK_QA_URL;

const isLogoutDialogVisible = ref(false);

const handleLogoutClick = () => {
  isLogoutDialogVisible.value = true;
};

const handleLogoutCancel = () => {
  isLogoutDialogVisible.value = false;
};

const handleLogoutConfirm = async () => {
  isLogoutDialogVisible.value = false;

  resetClientUserData();

  showSuccessToast({
    message: "已退出登录",
    position: "top"
  });

  await router.replace({ name: "login" });
};
</script>
