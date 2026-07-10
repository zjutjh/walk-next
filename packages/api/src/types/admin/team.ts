import { MemberWalkStatus } from "./member";

/** 搜索类型 */
export type SearchType = "team_id" | "captain_phone" | "captain_name";

/** 团队信息摘要 */
export interface TeamsTeamBriefInfo {
  /** 团队ID */
  team_id: number;
  /** 是否被标记为失联 */
  is_lost: boolean;
  /** 路线ID */
  route_name: string;
  /** 最新经过点位ID */
  latest_point_name: string;
  /** 最新经过点位时间 */
  latest_point_time: string;
  /** 队长姓名 */
  captain_name: string;
  /** 队长联系电话 */
  captain_phone: string;
}

/** 毅行人员角色 */
export type TeamMemberRole = "member" | "captain";

/** 毅行人员信息 */
export interface TeamsMemberInfo {
  /** 人员姓名 */
  name: string;
  /** 联系电话 */
  phone: string;
  /** 人员角色 */
  role: TeamMemberRole;
}

/** 团队状态 */
export type TeamWalkStatus = "not_start" | "in_progress" | "completed" | "withdrawn";

/** 团队状态信息 */
export interface TeamStatusInfo {
  /** 队名 */
  name: string;
  /** 上次打卡的点位ID */
  prev_point_name: string;
  /** 路线ID */
  route_name: string;
  /** 团队状态 */
  status: TeamWalkStatus;
  /** 是否走错路线 */
  is_wrong_route: boolean;
  /** 上次打卡点位是否异常 */
  is_prev_point_invalid: boolean;
  /** 是否在最近一次打卡时进入错误路线 */
  is_just_enter_wrong_route: boolean;
}

/** 重组团队人员信息 */
export interface TeamRebuildMember {
  /** 用户编号 */
  id: number;
  /** 姓名 */
  name: string;
  /** 当前状态 */
  status: MemberWalkStatus;
}
