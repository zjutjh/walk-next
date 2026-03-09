/** 搜索类型 */
export type SearchType = "team_id" | "captain_phone" | "captain_name";

/** 队伍信息摘要 */
export interface TeamsTeamBriefInfo {
  /** 队伍ID */
  team_id: string;
  /** 是否被标记为失联 */
  is_lost: boolean;
  /** 路线ID */
  route_name: string;
  /** 最新经过点位ID */
  prev_point_name: string;
  /** 最新经过点位时间 */
  prev_point_time: string;
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
