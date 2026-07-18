/** 人员行进状态 */
export type MemberWalkStatus =
  | "not_start"
  | "pending"
  | "abandoned"
  | "in_progress"
  | "withdrawn"
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

/** 成员状态信息 */
export interface TeamStatusMemberInfo {
  /** 姓名 */
  name: string;
  /** 成员身份 */
  role: "unbind" | "member" | "captain";
  /** 成员编号 */
  user_id: number;
  /** 成员行进状态 */
  walk_status: MemberWalkStatus;
  /** 成员是否违规 */
  is_violated: boolean;
}
