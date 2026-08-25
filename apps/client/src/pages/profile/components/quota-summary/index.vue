<template>
  <section :class="styles.section" :aria-label="t('剩余组队次数')">
    <div :class="styles.heading">
      <h2 :class="styles.title">{{ t("剩余组队次数") }}</h2>
      <button
        type="button"
        :class="styles.helpButton"
        :aria-label="t('剩余次数说明')"
        @click="emit('help')"
      >
        <van-icon name="question-o" />
      </button>
    </div>

    <div :class="styles.grid">
      <div :class="styles.item">
        <span :class="styles.label">{{ t("剩余创建团队次数") }}</span>
        <strong :class="styles.value">{{ props.createOp }}</strong>
      </div>
      <div :class="styles.item">
        <span :class="styles.label">{{ t("剩余加入团队次数") }}</span>
        <strong :class="styles.value">{{ props.joinOp }}</strong>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import styles from "./index.module.scss";

const props = defineProps<{
  createOp: number;
  joinOp: number;
}>();

const emit = defineEmits<{
  help: [];
}>();

const { t } = useI18n();
</script>
