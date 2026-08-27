<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-cell title="退出登录" clickable is-link @click="handleLogoutClick" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showSuccessToast } from "vant";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";

import styles from "./index.module.scss";

const router = useRouter();
const { resetClientUserData } = useClientUserData();

const handleLogoutClick = async () => {
  try {
    await showConfirmDialog({
      title: "退出登录",
      message: "确认退出当前账号吗？"
    });
  } catch {
    return;
  }

  resetClientUserData();

  showSuccessToast({
    message: "已退出登录",
    position: "top"
  });

  await router.replace({ name: "login" });
};
</script>
