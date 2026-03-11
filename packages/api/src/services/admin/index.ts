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

  /** 获取数据仪表盘校区总览 */
  QueryDashboardCampusOverview(
    req: AdminAPI.QueryDashboardCampusRequest,
    options?: T
  ): Promise<AdminAPI.QueryDashboardCampusResponse> {
    const url = this.genBaseURL("/dashboard/overview");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 获取数据仪表盘点位详情 */
  QueryDashboardPointDetails(
    req: AdminAPI.QueryDashboardPointDetailsRequest,
    options?: T
  ): Promise<AdminAPI.QueryDashboardPointDetailsResponse> {
    const url = this.genBaseURL("/dashboard/checkpoint");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 获取数据仪表盘行程段详情 */
  QueryDashboardSegmentDetails(
    req: AdminAPI.QueryDashboardSegmentDetailsRequest,
    options?: T
  ): Promise<AdminAPI.QueryDashboardSegmentDetailsResponse> {
    const url = this.genBaseURL("/dashboard/segment");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }
}
