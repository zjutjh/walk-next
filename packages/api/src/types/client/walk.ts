/** 用户与队伍共用的毅行状态 */
export type WalkStatus =
  | "not_start"
  | "pending"
  | "abandoned"
  | "in_progress"
  | "withdrawn"
  | "violated"
  | "completed";

/** 毅行阶段，空字符串表示活动未激活（未开始或已结束） */
export type WalkPhase =
  | ""
  | "registration"
  | "submission"
  | "adjustment"
  | "preparation"
  | "activity";
