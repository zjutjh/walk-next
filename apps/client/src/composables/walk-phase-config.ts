import { queryOptions, useQuery } from "@tanstack/vue-query";
import { useTimeoutFn, watchImmediate } from "@vueuse/core";
import type { PhaseTimeItem, WalkPhase } from "api/types/client";
import { computed, onScopeDispose, type Ref, ref } from "vue";

import { CLIENT_QUERY_KEY } from "@/constants";
import { INACTIVE_WALK_STAGE, WALK_STAGES } from "@/constants/walk-progress";
import { walkClientService } from "@/utils";

/** 毅行阶段查询配置 */
const WALK_PHASE_QUERY_OPTIONS = queryOptions({
  queryKey: [CLIENT_QUERY_KEY.USER.PHASE] as const,
  queryFn: () => walkClientService.QueryPhase()
});

/** 阶段同步结果 */
interface SyncResult {
  /** 当前所处的毅行阶段 */
  currentPhase: WalkPhase | null;
  /** 下一阶段边界的时间戳（毫秒） */
  nextBoundary: number | null;
}

/** 阶段结束时间的容差（毫秒），用于填补后端秒级精度产生的阶段间间隙 */
const PHASE_END_TOLERANCE = 999;

/** 根据阶段时间列表，定位当前时刻所处的阶段及最近的下一时间边界 */
const syncFromPhases = (phases: PhaseTimeItem[]): SyncResult => {
  const nowMs = Date.now();
  let exactPhase: WalkPhase | null = null;
  let tolerantPhase: WalkPhase | null = null;
  let nextBoundary: number | null = null;

  const considerBoundary = (ms: number) => {
    if (nowMs < ms && (nextBoundary == null || ms < nextBoundary)) {
      nextBoundary = ms;
    }
  };

  for (const p of phases) {
    // 将空格分隔的日期时间规范化为 ISO 格式，避免 WebKit 上 Date.parse 返回 NaN
    const startMs = Date.parse(p.start.replace(" ", "T"));
    const endMs = Date.parse(p.end.replace(" ", "T"));

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) continue;

    if (startMs <= nowMs && nowMs <= endMs) {
      exactPhase = p.phase;
    } else if (startMs <= nowMs && nowMs <= endMs + PHASE_END_TOLERANCE) {
      tolerantPhase = p.phase;
    }
    considerBoundary(startMs);
    considerBoundary(endMs);
    considerBoundary(endMs + PHASE_END_TOLERANCE);
  }

  return { currentPhase: exactPhase ?? tolerantPhase, nextBoundary };
};

/** 同步阶段配置并调度下一次定时器 */
const applyPhaseSync = (
  phases: PhaseTimeItem[] | undefined,
  currentPhase: Ref<WalkPhase | null>,
  nextBoundary: Ref<number | null>,
  startTimer: () => void,
  stopTimer: () => void
) => {
  stopTimer();
  if (!phases?.length) {
    currentPhase.value = null;
    nextBoundary.value = null;
    return;
  }
  const result = syncFromPhases(phases);
  currentPhase.value = result.currentPhase;
  nextBoundary.value = result.nextBoundary;
  if (nextBoundary.value != null) startTimer();
};

/** 毅行阶段配置：按后端时间区间定位当前阶段，并在阶段边界自动切换 */
export const useWalkPhaseConfig = () => {
  const {
    data: phaseConfig,
    isPending: isPhaseLoading,
    error: phaseError,
    refetch: refetchPhase
  } = useQuery(WALK_PHASE_QUERY_OPTIONS);

  /** 当前所处的毅行阶段 */
  const currentPhase = ref<WalkPhase | null>(null);
  /** 下一阶段边界的时间戳（毫秒） */
  const nextBoundary = ref<number | null>(null);

  // 阶段边界到达时重新同步，让阶段无需重新请求也能随时间自动切换
  const { start, stop } = useTimeoutFn(
    () => {
      const phases = phaseConfig.value?.phases;
      if (!phases) return;
      applyPhaseSync(phases, currentPhase, nextBoundary, start, stop);
    },
    computed(() => {
      const ms = nextBoundary.value;
      if (ms == null) return -1;
      const delay = ms - Date.now();
      return delay > 0 ? delay : 0;
    }),
    { immediate: false }
  );

  // 阶段配置变化时重新同步
  watchImmediate(
    () => phaseConfig.value?.phases,
    (phases) => {
      applyPhaseSync(phases, currentPhase, nextBoundary, start, stop);
    }
  );

  /** 当前阶段展示信息 */
  const currentStage = computed(() => {
    if (currentPhase.value == null || currentPhase.value === "") return INACTIVE_WALK_STAGE;
    return WALK_STAGES.find((stage) => stage.phase === currentPhase.value) ?? INACTIVE_WALK_STAGE;
  });

  /** 当前阶段在 WALK_STAGES 中的索引 */
  const currentStageIndex = computed(() => {
    if (currentStage.value === INACTIVE_WALK_STAGE) return -1;
    return WALK_STAGES.findIndex((stage) => stage.phase === currentStage.value.phase);
  });

  onScopeDispose(() => {
    stop();
  });

  return {
    phaseConfig,
    currentStage,
    currentStageIndex,
    isPhaseLoading,
    phaseError,
    refetchPhase
  };
};
