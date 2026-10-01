<template>
  <van-checkbox v-model="model" :class="styles.checkbox" shape="round">
    <i18n-t keypath="我已阅读并同意{w}" tag="span" scope="global">
      <template #w>
        <span :class="styles.termsLink" @click.stop="handleClick">
          {{ t("《用户协议与隐私政策》") }}
        </span>
      </template>
    </i18n-t>
  </van-checkbox>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import styles from "./index.module.scss";

const model = defineModel<boolean>({ required: true });

const router = useRouter();
const { t } = useI18n();

const handleClick = () => {
  router.push({ name: "userAgreement" });
};
</script>
