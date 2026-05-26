import type { QrCodeType } from "./qr-code";
import type { OverviewStatsRouteData, PointStat, RouteStat } from "./stats";
import type { TeamStatusInfo } from "./team";
import type {
  UserCampusExample,
  UserContactExample,
  UserGenderExample,
  UserTypeExample
} from "./user";
import { TeamStatusWalkerInfo } from "./walker";

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

/** 管理员登录 请求 */
export interface AuthRequest {
  /** 用户名 */
  account: string;
  /** 密码 */
  password: string;
}

/** 管理员登录 返回 */
export interface AuthResponse {
  /** 管理员姓名 */
  name: string;
  /** 点位名称 */
  point_name: string;
}

/** 管理员退出登录 请求 */
export type LogoutRequest = undefined;

/** 管理员退出登录 返回 */
export type LogoutResponse = Record<string, never>;

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

/** 获取所有路线统计数据 请求 */
export type QueryOverviewStatsRequest = undefined;

/** 获取所有路线统计数据 返回 */
export interface QueryOverviewStatsResponse {
  /** 路线统计列表 */
  routes: OverviewStatsRouteData[];
}

/** 获取路线统计数据 请求 */
export interface QueryRouteStatsRequest {
  /** 路线代号 */
  name: string;
}

/** 获取路线统计数据 返回 */
export interface QueryRouteStatsResponse {
  /** 路线统计数据 */
  status_stats: RouteStat;
  /** 路线统计数据（包含所有点位） */
  point_stats: PointStat[];
}

/** 获取团队状态 请求 */
export interface GetTeamStatusRequest {
  /** 团队ID */
  team_id: number;
}

/** 获取团队状态 响应 */
export interface GetTeamStatusResponse {
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
  /** 队伍编号 */
  team_id: number;
}

/** 终点确认 请求 */
export interface ConfirmDestinationRequest {
  /** 团队编号 */
  team_id: number;
}

/** 终点确认 响应 */
export type ConfirmDestinationResponse = null;

/** 标记队伍违规 请求 */
export interface MarkTeamViolationRequest {
  /** 团队编号 */
  team_id: number;
}

/** 标记队伍违规 响应 */
export type MarkTeamViolationResponse = null;
