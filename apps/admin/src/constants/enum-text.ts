import type { MemberStatsMetric, MemberWalkStatus, TeamMemberRole } from "api/types/admin";

/** 团队成员角色的中文名 */
export const TEAM_MEMBER_ROLE_TEXT = {
  captain: "队长",
  member: "队员"
} as const satisfies Record<TeamMemberRole, string>;

/** 人员状态的中文名 */
export const WALKER_STATUS_TEXT = {
  not_start: "未开始",
  pending: "待出发",
  in_progress: "进行中",
  abandoned: "已放弃",
  withdrawn: "已下撤",
  violated: "已违规",
  completed: "已完成"
} as const satisfies Record<MemberWalkStatus, string>;

/** 人员统计指标的中文名 */
export const WALKER_STATS_METRIC_TEXT = {
  total_reg: "总报名",
  not_present: "未到场",
  pending: WALKER_STATUS_TEXT.pending,
  in_progress: WALKER_STATUS_TEXT.in_progress,
  finished: "已结束",
  withdrawn: "下撤",
  wrong_route: "走错路线"
} as const satisfies Record<MemberStatsMetric, string>;
