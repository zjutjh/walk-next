import type { WalkerStatsMetric } from "api/types/admin";

/** 人员统计指标的中文名 */
export const WALKER_STATS_METRIC_TEXT = {
  total_reg: "总报名",
  not_present: "未到场",
  pending: "待出发",
  started: "已出发",
  in_progress: "进行中",
  finished: "已结束",
  withdrawn: "下撤",
  wrong_route: "走错路线"
} as const satisfies Record<WalkerStatsMetric, string>;
