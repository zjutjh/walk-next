/** 团队状态枚举类型  */
export const TEAM_STATUS_MAP = {
  notStart: "未开始",
  pending: "待出发",
  inProgress: "进行中",
  abandoned: "已放弃"
} as const;

/** 团队成员状态枚举类型  */
export type MemberStatus = keyof typeof TEAM_STATUS_MAP;

/**  状态选择弹窗选项 */
export const STATUS_OPTIONS: { name: string; value: MemberStatus }[] = [
  { name: TEAM_STATUS_MAP.pending, value: "pending" },
  { name: TEAM_STATUS_MAP.abandoned, value: "abandoned" }
];

/** 测试用团队 ID */
export const DEV_TEAM_ID = 1 as const;
