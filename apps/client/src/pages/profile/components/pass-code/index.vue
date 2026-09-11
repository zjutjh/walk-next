<template>
  <pass-code :title="t('个人通行码')" :label="t('个人通行码')" icon="scan">
    <qr-code :value="qrCodeValue" :class="styles.qrCode" />
    <p :class="styles.number">
      <span>{{ t("序号") }}</span>
      <strong>{{ userId }}</strong>
    </p>
  </pass-code>
</template>

<script setup lang="ts">
import { ClientQrCodeType } from "api/types/client";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import PassCode from "@/components/pass-code/index.vue";
import QrCode from "@/components/qr-code/index.vue";

import styles from "./index.module.scss";

const props = defineProps<{ userId: number }>();

const { t } = useI18n();

const qrCodeValue = computed(() =>
  JSON.stringify({ type: ClientQrCodeType.Member, user_id: props.userId })
);
</script>
