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
      <loading-container
        :class="styles.loading"
        :loading="isPhaseLoading"
        :text="$t('refresh.loading')"
      >
        <div :class="styles.header">
          <van-icon :name="currentStage.icon" :class="styles.icon" />
          <div>
            <p :class="styles.title">{{ $t(currentStage.title) }}</p>
            <p :class="styles.description">{{ $t(currentStage.description) }}</p>
          </div>
        </div>
      </loading-container>

      <van-steps :class="styles.stages" :active="currentStageIndex">
        <van-step v-for="stage in WALK_STAGES" :key="stage.title">
          <span :class="styles.stageTitle">{{ $t(stage.title) }}</span>
        </van-step>
      </van-steps>
    </error-empty>
  </section>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { ErrorEmpty, LoadingContainer } from "shared";
import { computed } from "vue";

import { CLIENT_QUERY_KEY } from "@/constants";
import { INACTIVE_WALK_STAGE, WALK_STAGES } from "@/constants/walk-progress";
import { walkClientService } from "@/utils";

import styles from "./index.module.scss";

const {
  data: phaseData,
  isPending: isPhaseLoading,
  error: phaseError,
  refetch: refetchPhase
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.USER.PHASE] as const,
  queryFn: () => walkClientService.QueryPhase()
});

/** 当前阶段序号，-1 表示不在活动时期内，步骤条无高亮 */
const currentStageIndex = computed(() =>
  WALK_STAGES.findIndex((stage) => stage.phase === phaseData.value?.phase)
);

const currentStage = computed(
  () => WALK_STAGES.find((stage) => stage.phase === phaseData.value?.phase) ?? INACTIVE_WALK_STAGE
);
</script>
