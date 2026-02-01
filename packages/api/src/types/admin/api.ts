import type { UserInfoExample, UserTypeExample } from "./user";

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
  userType: UserTypeExample;
  // 注意：前端的请求、响应字段均使用小驼峰命名，无需与后端(user_type)一致，会自动转换
};

/** 登出 请求（示例） */
export type LogoutExampleRequest = undefined; // 若请求body json/query params为空: 写undefined，因为其类型是“可选成员”，undefined合法，null不合法

/** 登出 返回（示例） */
export type LogoutExampleResponse = null; // 若返回data为空: 写null，因为收到的data确实是null

/** 获取用户信息 请求（示例） */
export interface QueryProfileExampleRequest {
  /** 要获取的用户的ID */
  userId: string;
}

/** 获取用户信息 返回（示例） */
export type QueryProfileExampleResponse = UserInfoExample; // 若请求体或返回体与某个抽象数据类型完全相同，可以直接这么写
