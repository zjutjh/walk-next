import type * as ClientAPI from "../../types/client/api";
import { BaseService } from "../../utils";

export default class WalkClientService<T> extends BaseService<T> {
  /** 用户登录 */
  Login(req: ClientAPI.LoginRequest, options?: T): Promise<ClientAPI.LoginResponse> {
    const url = this.genBaseURL("/user/login");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 获取用户信息 */
  QueryUserInfo(
    req?: ClientAPI.QueryUserInfoRequest,
    options?: T
  ): Promise<ClientAPI.QueryUserInfoResponse> {
    const url = this.genBaseURL("/user/info");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 修改用户信息 */
  UpdateUserInfo(
    req: ClientAPI.UpdateUserInfoRequest,
    options?: T
  ): Promise<ClientAPI.UpdateUserInfoResponse> {
    const url = this.genBaseURL("/user/modify");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 校友注册 */
  AlumRegister(
    req: ClientAPI.AlumRegisterRequest,
    options?: T
  ): Promise<ClientAPI.AlumRegisterResponse> {
    const url = this.genBaseURL("/user/register/alumnus");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 学生注册 */
  StudentRegister(
    req: ClientAPI.StudentRegisterRequest,
    options?: T
  ): Promise<ClientAPI.StudentRegisterResponse> {
    const url = this.genBaseURL("/user/register/student");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 教职工注册 */
  TeacherRegister(
    req: ClientAPI.TeacherRegisterRequest,
    options?: T
  ): Promise<ClientAPI.TeacherRegisterResponse> {
    const url = this.genBaseURL("/user/register/teacher");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 创建团队 */
  CreateTeam(req: ClientAPI.CreateTeamRequest, options?: T): Promise<ClientAPI.CreateTeamResponse> {
    const url = this.genBaseURL("/user/team/create");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 获取团队详情 */
  QueryTeamDetail(
    req?: ClientAPI.QueryTeamDetailRequest,
    options?: T
  ): Promise<ClientAPI.QueryTeamDetailResponse> {
    const url = this.genBaseURL("/user/team/detail");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 解散团队 */
  DisbandTeam(
    req?: ClientAPI.DisbandTeamRequest,
    options?: T
  ): Promise<ClientAPI.DisbandTeamResponse> {
    const url = this.genBaseURL("/user/team/disband");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 加入团队 */
  JoinTeam(req: ClientAPI.JoinTeamRequest, options?: T): Promise<ClientAPI.JoinTeamResponse> {
    const url = this.genBaseURL("/user/team/join");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 离开团队 */
  LeaveTeam(req?: ClientAPI.LeaveTeamRequest, options?: T): Promise<ClientAPI.LeaveTeamResponse> {
    const url = this.genBaseURL("/user/team/leave");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 获取队员详情 */
  QueryTeamMember(
    req: ClientAPI.QueryTeamMemberRequest,
    options?: T
  ): Promise<ClientAPI.QueryTeamMemberResponse> {
    const url = this.genBaseURL("/user/team/member");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 获取团队页面基本信息 */
  QueryTeamOverview(
    req?: ClientAPI.QueryTeamOverviewRequest,
    options?: T
  ): Promise<ClientAPI.QueryTeamOverviewResponse> {
    const url = this.genBaseURL("/user/team/overview");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 随机加入团队 */
  RandomJoinTeam(
    req: ClientAPI.RandomJoinTeamRequest,
    options?: T
  ): Promise<ClientAPI.RandomJoinTeamResponse> {
    const url = this.genBaseURL("/user/team/random-join");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 获取随机组队列表 */
  QueryRandomTeamList(
    req: ClientAPI.QueryRandomTeamListRequest,
    options?: T
  ): Promise<ClientAPI.QueryRandomTeamListResponse> {
    const url = this.genBaseURL("/user/team/random-list");
    const method = "GET";
    const params = req;

    return this.request({ url, method, params }, options);
  }

  /** 移除成员 */
  RemoveTeamMember(
    req: ClientAPI.RemoveTeamMemberRequest,
    options?: T
  ): Promise<ClientAPI.RemoveTeamMemberResponse> {
    const url = this.genBaseURL("/user/team/remove");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 更换队长 */
  UpdateTeamCaptain(
    req: ClientAPI.UpdateTeamCaptainRequest,
    options?: T
  ): Promise<ClientAPI.UpdateTeamCaptainResponse> {
    const url = this.genBaseURL("/user/team/captain");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 撤销提交 */
  UndoTeamSubmission(
    req?: ClientAPI.UndoTeamSubmissionRequest,
    options?: T
  ): Promise<ClientAPI.UndoTeamSubmissionResponse> {
    const url = this.genBaseURL("/user/team/rollback");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 提交团队 */
  SubmitTeam(
    req?: ClientAPI.SubmitTeamRequest,
    options?: T
  ): Promise<ClientAPI.SubmitTeamResponse> {
    const url = this.genBaseURL("/user/team/submit");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }

  /** 修改团队 */
  UpdateTeamInfo(
    req: ClientAPI.UpdateTeamInfoRequest,
    options?: T
  ): Promise<ClientAPI.UpdateTeamInfoResponse> {
    const url = this.genBaseURL("/user/team/update");
    const method = "POST";
    const data = req;

    return this.request({ url, method, data }, options);
  }
}
