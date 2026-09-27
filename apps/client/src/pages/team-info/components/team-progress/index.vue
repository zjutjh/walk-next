<template>
  <section :class="styles.section" :aria-label="t('毅行流程')">
    <div :class="styles.header">
      <van-icon :name="currentStage.icon" :class="styles.icon" />
      <div>
        <p :class="styles.title">{{ t(currentStage.title) }}</p>
        <p :class="styles.description">{{ t(currentStage.description) }}</p>
      </div>
    </div>

    <van-steps :class="styles.stages" :active="CURRENT_STAGE_INDEX">
      <van-step v-for="stage in WALK_STAGES" :key="stage.title">
        <span :class="styles.stageTitle">{{ t(stage.title) }}</span>
      </van-step>
    </van-steps>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { CURRENT_STAGE_INDEX, WALK_STAGES } from "@/constants/walk-progress";

import styles from "./index.module.scss";

const { t } = useI18n();
const currentStage = computed(() => WALK_STAGES[CURRENT_STAGE_INDEX]);
</script>
