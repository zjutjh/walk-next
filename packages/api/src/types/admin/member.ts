/** 人员状态 */
export type MemberWalkStatus =
  | "not_start"
  | "pending"
  | "abandoned"
  | "in_progress"
  | "withdrawn"
  | "violated"
  | "completed";

/** 人员统计指标 */
export type MemberStatsMetric =
  | "total_reg"
  | "not_present"
  | "pending"
  | "in_progress"
  | "finished"
  | "withdrawn"
  | "wrong_route";

/** 团队状态中的成员信息 */
export interface TeamStatusMemberInfo {
  /** 姓名 */
  name: string;
  /** 用户身份 */
  role: "unbind" | "member" | "captain" | (string & {});
  /** 用户编号 */
  user_id: number;
  /** 用户状态 */
  walk_status: MemberWalkStatus;
}
