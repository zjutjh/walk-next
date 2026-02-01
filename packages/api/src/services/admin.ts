import { AdminAPI } from "../types/admin";
import { BaseService } from "../utils";

export default class WalkAdminService<T> extends BaseService<T> {
  /** 管理员登录（示例） */
  LoginExample(
    req: AdminAPI.LoginExampleRequest,
    options?: T
  ): Promise<AdminAPI.LoginExampleResponse> {
    // AdminAPI.xxxRequest AdminAPI.xxxResponse是定义在packages\api\types\api.ts里的类型
    // "/login"是接口 method是HTTP方法
    // data是body json请求体，如果改为params就是query params请求参数（见下面那个接口）
    // (具体用data还是params要看Apifox里规定请求参数是哪一类。如果无请求参数，选哪个都不影响)
    // 只有上述内容因接口不同而不同，其余地方每个接口都是一样的，请勿改动
    const url = this.genBaseURL("/login-example");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 获取用户信息（示例） */
  QueryProfileExample(
    req: AdminAPI.QueryProfileExampleRequest,
    options?: T
  ): Promise<AdminAPI.QueryProfileExampleResponse> {
    const url = this.genBaseURL("/user/profile-example");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }
}
