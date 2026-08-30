<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-cell :title="t('反馈')" clickable is-link @click="handleFeedbackClick" />
      <van-cell :title="t('退出登录')" clickable is-link @click="handleLogoutClick" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { useClientUserData, useConfirmDialog } from "@/composables";

import styles from "./index.module.scss";

const router = useRouter();
const { t } = useI18n();
const { resetClientUserData } = useClientUserData();
const { confirmDialog } = useConfirmDialog();

const handleFeedbackClick = () => {
  router.replace({ name: "feedback" });
};

const handleLogoutClick = async () => {
  const isConfirmed = await confirmDialog({
    title: t("您是否确认退出？"),
    actionText: t("确认"),
    dismissText: t("再想想")
  });

  if (!isConfirmed) return;

  resetClientUserData();

  showSuccessToast({
    message: t("已退出登录"),
    position: "top"
  });

  await router.replace({ name: "login" });
};
</script>
