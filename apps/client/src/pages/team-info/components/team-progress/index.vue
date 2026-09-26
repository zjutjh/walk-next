<template>
  <section :class="styles.section" :aria-label="t('毅行流程')">
    <div :class="styles.header">
      <van-icon :name="currentStage.icon" :class="styles.icon" />
      <div>
        <p :class="styles.title">{{ t(currentStage.title) }}</p>
        <p :class="styles.description">{{ t(currentStage.description) }}</p>
      </div>
    </div>

    <ol :class="styles.stages">
      <li
        v-for="(stage, index) in WALK_STAGES"
        :key="stage.title"
        :class="[
          styles.stage,
          {
            [styles.currentStage!]: index === CURRENT_STAGE_INDEX,
            [styles.completedStage!]: index < CURRENT_STAGE_INDEX
          }
        ]"
      >
        <span :class="styles.stageMarker">
          <van-icon v-if="index < CURRENT_STAGE_INDEX" name="success" />
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span :class="styles.stageTitle">{{ t(stage.title) }}</span>
      </li>
    </ol>
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
