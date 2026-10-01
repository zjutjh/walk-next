<template>
  <van-checkbox v-model="model" :class="styles.checkbox" shape="round">
    <i18n-t keypath="我已阅读并同意{0}" tag="span">
      <router-link :class="styles.termsLink" :to="{ name: 'userAgreement' }" @click.stop>
        {{ t("《用户协议与隐私政策》") }}
      </router-link>
    </i18n-t>
  </van-checkbox>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import styles from "./index.module.scss";

const model = defineModel<boolean>({ required: true });

const { t } = useI18n();
</script>
