<template>
  <pass-code
    :title="$t('个人通行码')"
    :label="$t('个人通行码')"
    icon="qr"
    help
    :help-title="$t('个人通行码')"
    :help-message="$t('个人通行码用于团队重组、点位打卡。')"
  >
    <qr-code :value="qrCodeValue" :class="styles.qrCode" />
    <p :class="styles.number">
      <span>{{ $t("序号") }}</span>
      <strong>{{ props.userId }}</strong>
    </p>
  </pass-code>
</template>

<script setup lang="ts">
import { ClientQrCodeType } from "api/types/client";
import { computed } from "vue";

import PassCode from "@/components/pass-code/index.vue";
import QrCode from "@/components/qr-code/index.vue";

import styles from "./index.module.scss";

const props = defineProps<{ userId: number }>();

const qrCodeValue = computed(() =>
  // eslint-disable-next-line camelcase
  JSON.stringify({ type: ClientQrCodeType.Member, user_id: props.userId })
);
</script>
