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
