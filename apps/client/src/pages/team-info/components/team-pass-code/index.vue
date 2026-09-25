<template>
  <pass-code
    :title="t('团队通行码')"
    :label="t('团队通行码')"
    :icon="props.submitted ? 'qr' : 'qr-invalid'"
    :expanded="props.submitted"
    :hint="props.submitted ? '' : t('提交队伍后即可查看二维码')"
    help
    :help-title="t('团队通行码')"
    :help-message="t('团队通行码可用于绑定纸质码、点位打卡，团队提交后可见。')"
  >
    <template v-if="props.submitted">
      <qr-code :value="qrCodeValue" :class="styles.qrCode" />
      <p :class="styles.number">
        <span>{{ t("团队编号") }}</span>
        <strong>{{ props.teamId }}</strong>
      </p>
    </template>
    <p v-else :class="styles.hint">
      {{ t("提交队伍后即可查看二维码") }}
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

const props = defineProps<{ teamId: number; submitted: boolean }>();

const { t } = useI18n();

const qrCodeValue = computed(() =>
  // eslint-disable-next-line camelcase
  JSON.stringify({ type: ClientQrCodeType.Team, team_id: props.teamId })
);
</script>
