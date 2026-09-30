<template>
  <div :class="styles.page">
    <van-cell-group inset>
      <van-image :class="styles.decorationImg" :src="decorationImgUrl" />

      <van-cell :title="t('反馈')" to="/feedback" is-link />
      <van-cell :title="t('语言')" is-link @click="handleLanguageClick">
        {{ locale ? LANG_META[locale].name : "" }}
      </van-cell>
      <van-cell
        :class="styles.agreementCell"
        :title="t('用户协议与隐私政策')"
        to="/user-agreement"
        is-link
      >
        <van-badge :dot="!agreementStore.isSeen">
          {{ AGREEMENT_DATE }}
        </van-badge>
      </van-cell>
      <van-cell :title="t('报名须知与免责协议')" to="/registration-terms" is-link>
        {{ EVENT_SESSION }}
      </van-cell>
    </van-cell-group>

    <div :class="styles.buttonContainer">
      <van-button type="primary" block @click="handleLogoutClick">
        {{ t("退出登录") }}
      </van-button>
    </div>

    <language-action-sheet v-model:visible="isLanguageActionSheetVisible" />
  </div>
</template>

<script setup lang="ts">
import { showConfirmDialog, showSuccessToast } from "vant";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import decorationImgUrl from "@/assets/images/setting-page-banner.jpg";
import LanguageActionSheet from "@/components/language-action-sheet/index.vue";
import { useClientUserData, useUserLocale } from "@/composables";
import { AGREEMENT_DATE, EVENT_SESSION, LANG_META } from "@/constants";
import { useAgreementStore } from "@/store/agreement";

import styles from "./index.module.scss";

const router = useRouter();
const { locale } = useUserLocale();
const { t } = useI18n();
const { resetClientUserData } = useClientUserData();
const agreementStore = useAgreementStore();

/** 语言选择弹层是否可见 */
const isLanguageActionSheetVisible = ref(false);
/** 点击切换语言 */
const handleLanguageClick = () => {
  isLanguageActionSheetVisible.value = true;
};

/** 点击退出登录 */
const handleLogoutClick = () => {
  void showConfirmDialog({
    title: t("您是否确认退出？"),
    confirmButtonText: t("确认"),
    cancelButtonText: t("再想想"),
    theme: "round-button"
  })
    .then(async () => {
      resetClientUserData();
      showSuccessToast({ message: t("已退出登录") });
      await router.replace({ name: "login" });
    })
    .catch(() => undefined);
};
</script>
