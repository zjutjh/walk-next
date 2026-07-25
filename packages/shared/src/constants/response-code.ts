/** 业务状态码 */
export const RESP_CODE = {
  OK: 200,

  /** 系统错误 */
  SERVER_ERROR: 200100,
  /** 用户未登录 */
  NOT_LOGGED_IN: 200201,
  /** 登录过期，请重新登录 */
  LOGIN_EXPIRED: 200202,
  /** 用户无权限 */
  PERMISSION_DENIED: 200203,
  /** 参数非法 */
  PARAMETER_INVALID: 200204,
  /** 数据解析异常 */
  DATA_PARSE_ERROR: 200205,
  /** 数据不存在 */
  DATA_NOT_FOUND: 200206,
  /** 数据冲突 */
  DATA_CONFLICT: 200207,
  /** 系统维护中 */
  SERVICE_MAINTENANCE: 200208,
  /** 操作过于频繁 */
  TOO_FREQUENTLY: 200209,

  /** 该身份信息已注册 */
  ALREADY_REGISTERED: 200301,
  /** 统一身份验证失败 */
  OAUTH_FAILED: 200302,
  /** 已在团队中 */
  ALREADY_IN_TEAM: 200303,
  /** 团队人数已满 */
  TEAM_FULL: 200304,
  /** 尚未加入团队 */
  NOT_IN_TEAM: 200305,
  /** 仅队长可操作 */
  NOT_CAPTAIN: 200306,
  /** 创建团队次数已用完 */
  NO_CREATE_CHANCE: 200307,
  /** 加入团队次数已用完 */
  NO_JOIN_CHANCE: 200308,
  /** 团队已提交，无法操作 */
  TEAM_SUBMITTED: 200309,
  /** 团队名称已存在 */
  TEAM_NAME_DUPLICATED: 200310,
  /** 密码错误 */
  PASSWORD_WRONG: 200311,
  /** 团队人数不足 */
  TEAM_NOT_ENOUGH: 200312,
  /** OpenID为空 */
  OPEN_ID_EMPTY: 200313,
  /** 微信Code缺失 */
  WECHAT_CODE_MISSING: 200314,
  /** 账号或密码错误 */
  ACCOUNT_OR_PASSWORD_ERROR: 200315,
  /** 团队不存在 */
  TEAM_NOT_FOUND: 200316,
  /** 该用户没有名额 */
  USER_NO_QUOTA: 200317,
  /** 签到码绑定失败 */
  BIND_CODE_ERROR: 200318,
  /** 人员不存在 */
  PEOPLE_NOT_FOUND: 200319,
  /** 校区错误 */
  CAMPUS_MISMATCH: 200320,
  /** 登录失败次数过多，请稍后再试 */
  ADMIN_LOGIN_TOO_FREQUENTLY: 200322,
  /** 团队刚打过卡，不可标记失联 */
  TEAM_LOST_LOCKED: 200324,
  /** 非学生不可注册学生账号 */
  NON_STUDENT_REGISTER: 200325,
  /** 非教职工不可注册教职工账号 */
  NON_TEACHER_REGISTER: 200326,
  /** 信息错误，无法登录 */
  PEOPLE_INFO_WRONG: 200327,
  /** 不能添加自己 */
  CANNOT_ADD_SELF: 200328,
  /** 教师不可加入学生团队 */
  TEACHER_CANNOT_JOIN_STUDENT_TEAM: 200329,
  /** 非学生队不可将队长转让给学生 */
  CANNOT_CHANGE_CAPTAIN: 200330,
  /** 加入团队失败 */
  JOIN_TEAM_FAILED: 200331,
  /** 队长不可离开团队 */
  CANNOT_LEAVE_TEAM: 200332,
  /** 离开团队失败 */
  LEAVE_TEAM_FAILED: 200333,
  /** 团队不允许匹配 */
  TEAM_NOT_ALLOW_MATCH: 200334,
  /** 未找到符合要求的团队 */
  NOT_FIND_TEAMS: 200335,
  /** 不能移除自己 */
  CANNOT_REMOVE_SELF: 200336,
  /** 移除成员失败 */
  REMOVE_FAILED: 200337,
  /** 团队未提交，无法回滚 */
  TEAM_NOT_SUBMITTED: 200338,
  /** 当前时间不在报名时间内 */
  NOT_IN_REGISTER_TIME: 200339,
  /** 签到码已被绑定 */
  BIND_CODE_DUPLICATED: 200340
} as const;
