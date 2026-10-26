<template>
  <section
    :class="[styles.section, phaseError && !isPhaseLoading && styles.sectionError]"
    :aria-label="$t('毅行流程')"
  >
    <error-empty
      :error="phaseError"
      :disabled="isPhaseLoading"
      image-size="0.8rem"
      :btn-text="$t('重试')"
      @btn-click="refetchPhase"
    >
      <van-skeleton :class="styles.skeleton" :loading="isPhaseLoading" avatar title :row="1">
        <div :class="styles.header">
          <van-icon :name="currentStage.icon" :class="styles.icon" />
          <div>
            <p :class="styles.title">{{ $t(currentStage.title) }}</p>
            <p :class="styles.description">{{ $t(currentStage.description) }}</p>
          </div>
        </div>
      </van-skeleton>

      <van-steps :class="styles.stages" :active="currentStageIndex">
        <van-step v-for="stage in WALK_STAGES" :key="stage.title">
          <span :class="styles.stageTitle">{{ $t(stage.title) }}</span>
        </van-step>
      </van-steps>
    </error-empty>
  </section>
</template>

<script setup lang="ts">
import { ErrorEmpty } from "shared";

import { useWalkPhaseConfig } from "@/composables";
import { WALK_STAGES } from "@/constants/walk-progress";

import styles from "./index.module.scss";

const { currentStage, currentStageIndex, isPhaseLoading, phaseError, refetchPhase } =
  useWalkPhaseConfig();
</script>
