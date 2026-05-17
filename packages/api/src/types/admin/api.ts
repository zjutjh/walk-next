import type { QrCodeType } from "./qr-code";
import type { TeamMemberWalkStatus, TeamWalkStatus } from "./team";
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

/** 获取团队状态 请求 */
export interface QueryTeamStatusRequest {
  /** 团队ID */
  team_id: number;
}

/** 获取团队状态 返回 */
export interface QueryTeamStatusResponse {
  member?: {
    name: string;
    type: string;
    user_id: number;
    walk_status: string;
  }[];
  team?: {
    name: string;
    prev_point_name: string;
    route_name: string;
  };
}

/** 更改人员状态 请求 */
export interface UpdateUserStatusRequest {
  /** 未开始notStart, 待出发pending, 已放弃abandoned, 进行中inProgress */
  walk_status: string;
  /** 用户编号 */
  user_id: number;
}

/** 更改人员状态 返回 */
export interface UpdateUserStatusResponse {
  team_id: number;
}

/** 绑定签到码 请求 */
export interface BindTeamCodeRequest {
  /** 签到码 */
  content: string;
  /** 团队编号 */
  team_id: number;
}

/** 获取团队状态请求参数 */
export interface GetTeamStatusRequest {
  /** 团队编号 */
  team_id: number;
}

/** 团队成员状态 */
export interface TeamStatusMember {
  /** 姓名 */
  name: string;
  /** 用户身份 */
  role: "unbind" | "member" | "captain" | (string & {});
  /** 用户编号 */
  user_id: number;
  /** 用户状态 */
  walk_status: TeamMemberWalkStatus;
}

/** 团队状态 */
export interface TeamStatusTeam {
  /** 队名 */
  name: string;
  /** 点位名称 */
  prev_point_name: string;
  /** 路线名称 */
  route_name: string;
  /** 队伍状态 */
  status: TeamWalkStatus;
}

/** 获取团队状态响应数据 */
export interface GetTeamStatusResponse {
  /** 团队成员 */
  members: TeamStatusMember[];
  /** 团队信息 */
  team: TeamStatusTeam;
}

/** 绑定签到码请求参数 */
export interface BindCheckinCodeRequest {
  /** 签到码内容 */
  content: string;
  /** 团队编号 */
  team_id: number;
}

/** 绑定签到码 返回 */
export type BindTeamCodeResponse = null;
/** 绑定签到码响应数据 */
export type BindCheckinCodeResponse = null;

/** 打卡(指团队到了某个点位后打卡表示已经过)请求参数 */
export interface CheckinTeamRequest {
  /** CodeType */
  code_type: QrCodeType;
  /** Content */
  content: string;
}

/** 打卡(指团队到了某个点位后打卡表示已经过)响应数据 */
export interface CheckinTeamResponse {
  /** 队伍编号 */
  team_id: number;
}
