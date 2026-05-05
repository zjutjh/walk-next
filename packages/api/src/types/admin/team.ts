export const TEAM_MEMBER_WALK_STATUS = {
  NotStart: "notStart",
  /** 等待绑定签到码 */
  Pending: "pending",
  Abandoned: "abandoned",
  InProgress: "inProgress",
  Withdrawn: "withdrawn",
  Violated: "violated",
  Completed: "completed"
} as const;

export type TeamMemberWalkStatus =
  (typeof TEAM_MEMBER_WALK_STATUS)[keyof typeof TEAM_MEMBER_WALK_STATUS];
