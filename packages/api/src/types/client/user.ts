/** 用户性别 */
export const enum UserGender {
  Unknown = 0,
  Male = 1,
  Female = 2
}

/** 用户联系方式 */
export interface UserContact {
  /** QQ 号 */
  qq?: string;
  /** 电话 */
  tel?: string;
  /** 微信号 */
  wechat?: string;
}

/** 用户信息 */
export interface UserInfo {
  /** 剩余创建团队次数 */
  create_op: number;
  /** 剩余加入团队次数 */
  join_op: number;
  /** 学号或工号 */
  stu_id: string;
  /** 团队ID */
  team_id: number;
  /** 用户状态 */
  walk_status: UserWalkStatus;
  /** QQ 号 */
  qq?: string;
  /** 电话 */
  tel?: string;
  /** 微信号 */
  wechat?: string;
  /** ID */
  id: number;
  /** 队员姓名 */
  name: string;
  /** 队伍中身份 */
  role: UserRole;
  /** 人员类型 */
  type: UserType;
}

/** 用户身份 */
export type UserRole = "captain" | "member" | "unbind";

/** 用户总结 */
export interface UserSummary {
  /** ID */
  id: number;
  /** 队员姓名 */
  name: string;
  /** 队伍中身份 */
  role: UserRole;
  /** 人员类型 */
  type: UserType;
}

/** 用户类型 */
export type UserType = "alumnus" | "student" | "teacher";

/** 用户状态 */
export type UserWalkStatus =
  | "not_start"
  | "pending"
  | "abandoned"
  | "in_progress"
  | "withdrawn"
  | "violated"
  | "completed";
