<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-cell :title="t('反馈')" clickable is-link @click="handleFeedbackClick" />
      <van-cell :title="t('退出登录')" clickable is-link @click="handleLogoutClick" />
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
      <p :class="styles.logoutDialogMessage">{{ t("您是否确认退出？") }}</p>
      <div :class="styles.logoutDialogFooter">
        <van-button :class="styles.logoutDialogCancel" size="small" @click="handleLogoutConfirm">
          {{ t("确认") }}
        </van-button>
        <van-button
          :class="styles.logoutDialogConfirm"
          type="primary"
          size="small"
          @click="handleLogoutCancel"
        >
          {{ t("再想想") }}
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";

import styles from "./index.module.scss";

const router = useRouter();
const { t } = useI18n();
const { resetClientUserData } = useClientUserData();

const isLogoutDialogVisible = ref(false);

const handleFeedbackClick = () => {
  router.replace({ name: "feedback" });
};

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
    message: t("已退出登录"),
    position: "top"
  });

  await router.replace({ name: "login" });
};
</script>
