import type { RouteOverviewStat, RouteStat } from "api/types/admin";

/** 总览统计数据标签页标识符 */
export const OVERVIEW_TAB_NAME = "overview";

/** 总览统计数据字段列表 */
export const OVERVIEW_STATS_KEY_LIST: (keyof RouteOverviewStat)[] = [
  "total_reg",
  "not_present",
  "pending",
  "in_progress",
  "finished",
  "wrong_route",
  "withdrawn"
] as const;

/** 路线统计数据字段列表 */
export const ROUTE_STATS_KEY_LIST: (keyof RouteStat)[] = [
  "total_reg",
  "not_present",
  "in_progress",
  "wrong_route",
  "withdrawn"
] as const;
