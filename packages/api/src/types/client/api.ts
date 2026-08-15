import type { MemberWalkStatus } from "../admin";
import type { TeamRandomListItem, TeamSummary } from "./team";
import type { UserContact, UserGender, UserInfo, UserRegisterBasic, UserSummary } from "./user";

/** 用户登录 请求 */
export interface LoginRequest {
  /** 密码 */
  password: string;
  /** 手机号码 */
  tel: string;
}

/** 用户登录 响应 */
export interface LoginResponse {
  /** 系统JWT */
  jwt: string;
  /** 用户信息 */
  user: UserInfo;
}

/** 获取用户信息 请求 */
export type QueryUserInfoRequest = undefined;

/** 获取用户信息 响应 */
export interface QueryUserInfoResponse extends UserInfo {
  /** 性别 */
  gender: UserGender;
  /** 个人通行码，即用户 ID */
  pass_code: number;
}

/** 修改用户信息 请求 */
export interface UpdateUserInfoRequest {
  /** 联系方式 */
  contact: UserContact;
  /** 身份证号 */
  identity?: string;
}

/** 修改用户信息 响应 */
export type UpdateUserInfoResponse = null;

/** 校友注册 请求 */
export type AlumRegisterRequest = UserRegisterBasic;

/** 校友注册 响应 */
export type AlumRegisterResponse = null;

/** 学生注册 请求 */
export interface StudentRegisterRequest extends UserRegisterBasic, UserContact {
  /** 学号 */
  stu_id: string;
  /** 电话号 */
  tel: string;
}

/** 学生注册 响应 */
export type StudentRegisterResponse = null;

/** 教职工注册 请求 */
export type TeacherRegisterRequest = StudentRegisterRequest;

/** 教职工注册 响应 */
export type TeacherRegisterResponse = null;

/** 更换队长 请求 */
export interface UpdateTeamCaptainRequest {
  /** 更换的队长 ID */
  id: number;
}

/** 更换队长 响应 */
export type UpdateTeamCaptainResponse = null;

/** 创建团队 请求 */
export interface CreateTeamRequest {
  /** 是否允许随机匹配 */
  allow_match: boolean;
  /** 队伍名称 */
  name: string;
  /** 团队加入密码 */
  password: string;
  /** 团队所属路线 */
  route_name: string;
  /** 团队标语 */
  slogan: string;
}

/** 创建团队 响应 */
export interface CreateTeamResponse {
  /** 队伍 ID */
  team_id: number;
}

/** 团队详细信息 请求 */
export type QueryTeamDetailRequest = undefined;

/** 团队详细信息 响应 */
export interface QueryTeamDetailResponse extends TeamSummary {
  /** 是否允许随机匹配 */
  allow_match: boolean;
  // TODO: 这是什么？文档翻烂了也没找到
  code: string;
  /** 最新经过点位名称 */
  latest_point_name: string;
  /** 团队加入密码，仅队长返回 */
  password?: string;
  /** 队伍状态 */
  status: string;
  /** 是否已提交 */
  submitted: boolean;
  /** 团队类型 */
  type: string;
}

/** 解散团队 请求 */
export type DisbandTeamRequest = undefined;

/** 解散团队 响应 */
export type DisbandTeamResponse = null;

/** 加入团队 请求 */
export interface JoinTeamRequest {
  /** 团队加入密码 */
  password: string;
  /** 队伍ID */
  team_id: number;
}

/** 加入团队 响应 */
export type JoinTeamResponse = null;

/** 离开团队 请求 */
export type LeaveTeamRequest = undefined;

/** 离开团队 响应 */
export type LeaveTeamResponse = null;

/** 队员详细信息 请求 */
export interface QueryTeamMemberRequest {
  /** 成员 ID */
  id: number;
}

/** 队员详细信息 响应 */
export interface QueryTeamMemberResponse extends UserSummary, Required<UserContact> {
  /** 是否可移除 */
  can_remove: boolean;
  /** 是否可转让队长 */
  can_transfer_captain: boolean;
  /** 用户状态 */
  walk_status: MemberWalkStatus;
}

/** 团队页面基本信息 请求 */
export type QueryTeamOverviewRequest = undefined;

/** 团队页面基本信息 响应 */
export interface QueryTeamOverviewResponse {
  members: UserSummary[];
  team: TeamSummary;
}

/** 随机加入团队 请求 */
export interface RandomJoinTeamRequest {
  /** 团队 ID */
  id: number;
}

/** 随机加入团队 响应 */
export type RandomJoinTeamResponse = null;

/** 随机组队列表 请求 */
export interface QueryRandomTeamListRequest {
  /** 团队所属路线 */
  route_name: string;
}

/** 随机组队列表 响应 */
export interface QueryRandomTeamListResponse {
  /** 随机匹配团队列表 */
  teams: TeamRandomListItem[];
}

/** 移除成员 请求 */
export interface RemoveTeamMemberRequest {
  /** 成员 ID */
  id: number;
}

/** 移除成员 响应 */
export type RemoveTeamMemberResponse = null;

/** 撤销提交 请求 */
export type UndoTeamSubmissionRequest = undefined;

/** 撤销提交 响应 */
export type UndoTeamSubmissionResponse = null;

/** 提交团队 请求 */
export type SubmitTeamRequest = undefined;

/** 提交团队 响应 */
export type SubmitTeamResponse = null;

/** 修改团队 请求 */
export type UpdateTeamInfoRequest = CreateTeamRequest;

/** 修改团队 响应 */
export type UpdateTeamInfoResponse = null;
