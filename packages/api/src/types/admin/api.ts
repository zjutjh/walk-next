import type { DashboardRoutesOverviewData } from "./dashboard";
import type { QrCodeType } from "./qr-code";
import type { OverviewStatsRouteData, PointStat, RouteStat } from "./stats";
import type { SearchType, TeamsMemberInfo, TeamStatusInfo, TeamsTeamBriefInfo } from "./team";
import type {
  UserCampusExample,
  UserContactExample,
  UserGenderExample,
  UserTypeExample
} from "./user";
import type { TeamStatusWalkerInfo } from "./walker";

// 为什么要写 /** */？ ---> https://www.jsdoc.com.cn/
/** 登录 请求（示例） */
export interface LoginExampleRequest {
  /** 用户名 */
  account: string;
  /** 密码 */
  password: string;
}

/** 登录 响应（示例） */
export type LoginExampleResponse = {
  /** 用户类型 */
  user_type: UserTypeExample;
};

/** 登出 请求（示例） */
export type LogoutExampleRequest = undefined; // 若请求body json/query params为空: 写undefined，因为其类型是“可选成员”，undefined合法，null不合法

/** 登出 响应（示例） */
export type LogoutExampleResponse = null; // 若返回data为空: 写null，因为收到的data确实是null

/** 获取用户信息 请求（示例） */
export interface QueryProfileExampleRequest {
  /** 要获取的用户的ID */
  user_id: string;
}

/** 获取用户信息 响应（示例） */
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

/** 管理员登录 请求 */
export interface AuthRequest {
  /** 用户名 */
  account: string;
  /** 密码 */
  password: string;
}

/** 管理员登录 响应 */
export interface AuthResponse {
  /** 管理员姓名 */
  name: string;
  /** 点位名称 */
  point_name: string;
}

/** 管理员退出登录 请求 */
export type LogoutRequest = undefined;

/** 管理员退出登录 响应 */
export type LogoutResponse = Record<string, never>;

/** 获取数据仪表盘校区总览 请求 */
export interface QueryDashboardCampusRequest {
  /** 校区ID */
  campus: string;
}

/** 获取数据仪表盘校区总览 响应 */
export interface QueryDashboardCampusResponse {
  /** 各路线数据总览 */
  routes: DashboardRoutesOverviewData[];
}

/** 获取数据仪表盘点位详情 请求 */
export interface QueryDashboardPointDetailsRequest {
  /** 点位ID */
  point_name: string;
}

/** 获取数据仪表盘点位详情 响应 */
export interface QueryDashboardPointDetailsResponse {
  /** 未到达该点位的人数 */
  not_arrived_count: number;
  /** 经过该点位的总人数 */
  passed_count: number;
}

/** 获取数据仪表盘行程段详情 请求 */
export interface QueryDashboardSegmentDetailsRequest {
  /** 行程段始点ID */
  prev_point_name: string;
  /** 行程段末点ID */
  to_point_name: string;
}

/** 获取数据仪表盘行程段详情 响应 */
export interface QueryDashboardSegmentDetailsResponse {
  /** 行程段上的人数 */
  number: number;
}

/** 搜索筛选团队列表 请求 */
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

/** 搜索筛选团队列表 响应 */
export interface QueryTeamListResponse {
  /** 团队信息摘要列表 */
  teams: TeamsTeamBriefInfo[];
  /** 无限滚动下一页游标，0表示无更多数据 */
  next_cursor: number;
  /** 满足要求的团队总数 */
  total_count: number;
}

/** 获取团队详情 请求 */
export interface QueryTeamDetailsRequest {
  /** 团队ID */
  team_id: number;
}

/** 获取团队详情 响应 */
export interface QueryTeamDetailsResponse {
  /** 团队ID */
  team_id: number;
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

/** 设置团队失联状态 请求 */
export interface SetTeamLostRequest {
  /** 团队ID */
  team_id: number;
  /** 是否标记为失联 */
  is_lost: boolean;
}

/** 设置团队失联状态 响应 */
export type SetTeamLostResponse = null;

/** 获取所有路线统计数据 请求 */
export type QueryOverviewStatsRequest = undefined;

/** 获取所有路线统计数据 响应 */
export interface QueryOverviewStatsResponse {
  /** 路线统计列表 */
  routes: OverviewStatsRouteData[];
}

/** 获取路线统计数据 请求 */
export interface QueryRouteStatsRequest {
  /** 路线代号 */
  name: string;
}

/** 获取路线统计数据 响应 */
export interface QueryRouteStatsResponse {
  /** 路线统计数据 */
  status_stats: RouteStat;
  /** 路线统计数据（包含所有点位） */
  point_stats: PointStat[];
}

/** 获取团队状态 请求 */
export interface QueryTeamStatusRequest {
  /** 团队ID */
  team_id: number;
}

/** 获取团队状态 响应 */
export interface QueryTeamStatusResponse {
  /** 团队成员 */
  members: TeamStatusWalkerInfo[];
  /** 团队状态信息 */
  team: TeamStatusInfo;
}

/** 更改人员状态 请求 */
export interface UpdateWalkerStatusRequest {
  /** 未开始notStart, 待出发pending, 已放弃abandoned, 进行中inProgress */
  status: string;
  /** 用户编号 */
  user_id: number;
}

/** 更改人员状态 响应 */
export interface UpdateWalkerStatusResponse {
  team_id: number;
}

/**
 * 重组队伍 请求
 */
export interface RegroupTeamRequest {
  /** 用户编号，长度3-6人 */
  members: number[];
  /** 路线名称 */
  route_name: string;
}

/**
 * 重组队伍 响应
 */
export interface RegroupTeamResponse {
  /** 新重组的队伍编号 */
  team_id: number;
}

/**
 * 获取人员信息 请求
 */
export interface QueryUserInfoRequest {
  /** 用户编号 */
  user_id: number;
}

/**
 * 获取人员信息 响应
 */
export interface QueryUserInfoResponse {
  /** 姓名 */
  name: string;
}

/** 所有待出发改为进行中 请求 */
export type StartAllThePendingRequest = undefined;

/** 所有待出发改为进行中 响应 */
export type StartAllThePendingResponse = null;

/** 绑定签到码 请求 */
export interface BindCheckinCodeRequest {
  /** 签到码内容 */
  content: string;
  /** 团队编号 */
  team_id: number;
}

/** 绑定签到码 响应 */
export type BindCheckinCodeResponse = null;

/** 打卡(指团队到了某个点位后打卡表示已经过) 请求 */
export interface CheckinTeamRequest {
  /** CodeType */
  code_type: QrCodeType;
  /** Content */
  content: string;
}

/** 打卡(指团队到了某个点位后打卡表示已经过) 响应 */
export interface CheckinTeamResponse {
  /** 团队编号 */
  team_id: number;
}

/** 终点确认 请求 */
export interface ConfirmDestinationRequest {
  /** 团队编号 */
  team_id: number;
}

/** 终点确认 响应 */
export type ConfirmDestinationResponse = null;

/** 标记团队违规 请求 */
export interface MarkTeamViolationRequest {
  /** 团队编号 */
  team_id: number;
}

/** 标记团队违规 响应 */
export type MarkTeamViolationResponse = null;
