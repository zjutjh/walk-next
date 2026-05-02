import type { SearchType, TeamsMemberInfo, TeamsTeamBriefInfo } from "./team";
import type {
  UserCampusExample,
  UserContactExample,
  UserGenderExample,
  UserTypeExample
} from "./user";

// 为什么要写 /** */？ ---> https://www.jsdoc.com.cn/
/** 登录 请求（示例） */
export interface LoginExampleRequest {
  /** 用户名 */
  account: string;
  /** 密码 */
  password: string;
}

/** 登录 返回（示例） */
export type LoginExampleResponse = {
  /** 用户类型 */
  user_type: UserTypeExample;
};

/** 登出 请求（示例） */
export type LogoutExampleRequest = undefined; // 若请求body json/query params为空: 写undefined，因为其类型是“可选成员”，undefined合法，null不合法

/** 登出 返回（示例） */
export type LogoutExampleResponse = null; // 若返回data为空: 写null，因为收到的data确实是null

/** 获取用户信息 请求（示例） */
export interface QueryProfileExampleRequest {
  /** 要获取的用户的ID */
  user_id: string;
}

/** 获取用户信息 返回（示例） */
export interface QueryProfileExampleResponse {
  /** 学号 */
  stu_id: string;
  /** 姓名 */
  name: string;
  /** 校区 */
  campus: UserCampusExample;
  /** 性别 */
  gender: UserGenderExample;
  /** 联系方式 */
  contact: UserContactExample;
}

/** 搜索筛选队伍列表 请求 */
export interface QueryTeamListRequest {
  /** 校区ID */
  campus: string;
  /** 搜索关键词 */
  key?: string;
  /** 筛选的行程段的始点ID */
  prev_point_name?: string;
  /** 筛选的行程段的末点ID */
  to_point_name?: string;
  /** 搜索类型 */
  search_type?: SearchType;
  /** 无限滚动游标 */
  cursor: number;
  /** 无限滚动一次获取的数量 */
  limit: number;
}

/** 搜索筛选队伍列表 响应 */
export interface QueryTeamListResponse {
  /** 队伍信息摘要列表 */
  teams: TeamsTeamBriefInfo[];
  /** 无限滚动下一页游标，0表示无更多数据 */
  next_cursor: number;
  /** 满足要求的队伍总数 */
  total_count: number;
}

/** 获取队伍详情 请求 */
export interface QueryTeamDetailsRequest {
  /** 队伍ID */
  team_id: string;
}

/** 获取队伍详情 响应 */
export interface QueryTeamDetailsResponse {
  /** 队伍ID */
  team_id: string;
  /** 是否被标记为失联 */
  is_lost: boolean;
  /** 路线ID */
  route_name: string;
  /** 最新经过点位ID */
  prev_point_name: string;
  /** 经过点位时间 */
  prev_point_time: string;
  /** 队员信息列表 */
  members: TeamsMemberInfo[];
}

/** 设置队伍失联状态 请求 */
export interface SetTeamLostRequest {
  /** 队伍ID */
  team_id: string;
  /** 是否标记为失联 */
  is_lost: boolean;
}

/** 设置队伍失联状态 响应 */
export type SetTeamLostResponse = null;
