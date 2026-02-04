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
