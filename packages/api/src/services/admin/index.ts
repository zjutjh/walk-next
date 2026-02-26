import { AdminAPI } from "../../types/admin";
import { BaseService } from "../../utils";

export default class WalkAdminService<T> extends BaseService<T> {
  /** 管理员登录（示例） */
  LoginExample(
    req: AdminAPI.LoginExampleRequest,
    options?: T
  ): Promise<AdminAPI.LoginExampleResponse> {
    // AdminAPI.xxxRequest AdminAPI.xxxResponse是定义在packages\api\types\api.ts里的类型
    // "/login"是接口 method是HTTP方法
    // data是body json请求体，如果改为params就是query params请求参数（见下面那个接口）
    // (具体用data还是params要看Apifox里规定请求参数是哪一类)
    // 只有上述内容因接口不同而不同，其余地方每个接口都是一样的，请勿改动
    const url = this.genBaseURL("/login-example");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 管理员登出（示例） */
  LogoutExample(
    req: AdminAPI.LogoutExampleRequest,
    options?: T
  ): Promise<AdminAPI.LogoutExampleResponse> {
    const url = this.genBaseURL("/logout-example");
    const method = "POST";
    // 如果接口没有任何请求参数，选data还是query都不影响
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

  /** 获取团队状态 */
  QueryTeamStatus(
    req: AdminAPI.QueryTeamStatusRequest,
    options?: T
  ): Promise<AdminAPI.QueryTeamStatusResponse> {
    const url = this.genBaseURL("/admin/team/status");
    const method = "GET";
    const params = req; // GET请求使用 params

    return this.request({ url, method, params }, options);
  }

  /** 更改人员状态 */
  UpdateUserStatus(
    req: AdminAPI.UpdateUserStatusRequest,
    options?: T
  ): Promise<AdminAPI.UpdateUserStatusResponse> {
    const url = this.genBaseURL("/admin/user/update");
    const method = "POST";
    const data = req; // POST请求使用 data

    return this.request({ url, method, data }, options);
  }

  /** 绑定签到码 */
  BindTeamCode(
    req: AdminAPI.BindTeamCodeRequest,
    options?: T
  ): Promise<AdminAPI.BindTeamCodeResponse> {
    const url = this.genBaseURL("/admin/team/bind");
    const method = "POST";
    const data = req; // POST请求使用 data

    return this.request({ url, method, data }, options);
  }
}
