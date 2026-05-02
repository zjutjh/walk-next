// 请根据实际项目配置替换包名，如 "@walk/api"
import type { MemberStatus } from "api/types/admin";

/** 状态枚举到中文的视图映射 */
export const TEAM_STATUS_MAP: Record<MemberStatus, string> = {
  notStart: "未开始",
  pending: "待出发",
  inProgress: "进行中",
  abandoned: "已放弃",
  withdrawn: "已下撤",
  violated: "已违规",
  completed: "已完成"
} as const;

/** 状态选择弹窗配置项 */
export const STATUS_OPTIONS: { name: string; value: MemberStatus }[] = [
  { name: TEAM_STATUS_MAP.pending, value: "pending" },
  { name: TEAM_STATUS_MAP.abandoned, value: "abandoned" }
];

/** 测试环境使用的固定团队 ID */
export const DEV_TEAM_ID = 1 as const;
