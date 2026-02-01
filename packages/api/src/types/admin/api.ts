import type { UserInfoExample } from "./user";

/** 登录 请求（示例） */
export interface LoginExampleRequest {
  /** 用户名 */
  account: string;
  /** 密码 */
  password: string;
}

/** 登录 返回（示例） */
export type LoginExampleResponse = null; // 若返回data为空: 写null，因为收到的data确实是null，名实相符

/** 获取用户信息 请求（示例） */
export type QueryProfileExampleRequest = undefined; // 若请求body为空: 写undefined，因为这个成员的类型是“可选的Record”，undefined合法，null不合法

/** 获取用户信息 返回（示例） */
export type QueryProfileExampleResponse = UserInfoExample; // 若请求体或返回体与某个抽象数据类型完全相同，可以直接这么写
