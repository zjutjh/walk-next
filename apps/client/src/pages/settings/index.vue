<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-image :class="styles.decorationImg" :src="decorationImgUrl" />

      <van-cell :title="t('反馈')" to="/feedback" is-link />
      <van-cell :title="t('语言')" is-link @click="handleLanguageClick">{{
        locale ? LANG_DISPLAY_NAME[locale] : ""
      }}</van-cell>
      <van-cell :title="t('用户协议')" to="/terms" is-link />
      <van-cell :title="t('隐私政策')" to="/privacy" is-link />
      <van-cell :title="t('报名须知与免责协议')" is-link />
    </van-cell-group>

    <div :class="styles.buttonContainer">
      <van-button :class="styles.logoutButton" type="primary" block @click="handleLogoutClick">
        {{ t("退出登录") }}
      </van-button>
    </div>

    <language-action-sheet v-model:visible="isLanguageActionSheetVisible" />
  </div>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import decorationImgUrl from "@/assets/images/setting-page-banner.jpg";
import LanguageActionSheet from "@/components/language-action-sheet/index.vue";
import { confirmDialog, useClientUserData, useUserLocale } from "@/composables";
import { LANG_DISPLAY_NAME } from "@/constants";

import styles from "./index.module.scss";

const router = useRouter();
const { locale } = useUserLocale();
const { t } = useI18n();
const { resetClientUserData } = useClientUserData();

/** 语言选择弹层是否可见 */
const isLanguageActionSheetVisible = ref(false);
/** 点击切换语言 */
const handleLanguageClick = () => {
  isLanguageActionSheetVisible.value = true;
};

/** 点击退出登录 */
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
