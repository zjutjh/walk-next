/** 业务状态码 */
export const RESP_CODE = {
  OK: 200,
  /** 未知错误 */
  UNKNOWN_ERROR: 10000,
  /** 数据库错误 */
  DATABASE_ERROR: 10002,
  /** 中间件服务错误 */
  MIDDLEWARE_SERVICE_ERROR: 10004,
  /** 用户未登录 */
  NOT_LOGGED_IN: 20000,
  /** 用户无权限 */
  PERMISSION_DENIED: 20002,
  /** 参数错误 */
  PARAMETER_INVALID: 20003,
  /** 数据不存在 */
  DATA_NOT_FOUND: 20005,
  /** 数据冲突 */
  DATA_CONFLICT: 20006,
  /** 操作过于频繁/未获得锁 */
  TOO_FREQUENTLY: 20008,
  /** 参数不足 */
  INSUFFICIENT_PARAMS: 20009,
  /** 该身份信息已报名 */
  ALREADY_REGISTERED: 30001,
  /** 统一身份验证失败 */
  OAUTH_FAILED: 30002,
  /** 已在队伍中 */
  ALREADY_IN_TEAM: 30004,
  /** 队伍人数已满 */
  TEAM_FULL: 30005,
  /** 尚未加入队伍 */
  NOT_IN_TEAM: 30006,
  /** 仅队长可操作 */
  NOT_CAPTAIN: 30007,
  /** 创建队伍次数已用完 */
  NO_CREATE_CHANCE: 30008,
  /** 加入队伍次数已用完 */
  NO_JOIN_CHANCE: 30009,
  /** 队伍已提交，无法操作 */
  TEAM_SUBMITTED: 30010,
  /** 队伍名称已存在 */
  TEAM_NAME_DUPLICATED: 30011,
  /** 密码错误 */
  PASSWORD_WRONG: 30012,
  /** 队伍人数不足 */
  TEAM_NOT_ENOUGH: 30013,
  /** OpenID为空 */
  OPEN_ID_EMPTY: 30017,
  /** 微信Code缺失 */
  WECHAT_CODE_MISSING: 30018,
  /** 账号或密码错误 */
  ACCOUNT_OR_PASSWORD_ERROR: 30019,
  /** 队伍不存在 */
  TEAM_NOT_FOUND: 30021,
  /** 该用户没有名额 */
  USER_NO_QUOTA: 30022,
  /** 签到码绑定失败 */
  BIND_CODE_ERROR: 30023,
  /** 人员不存在 */
  PEOPLE_NOT_FOUND: 30024,
  /** 校区错误 */
  CAMPUS_MISMATCH: 30025,
  /** 该队伍已完成，无法进行点位打卡 */
  TEAM_CHECKIN_CLOSED: 30026,
  /** 上一签到点并非路线前序点位 */
  PREV_POINT_INVALID: 30027,
  /** 该团队路线走错，请立即提醒 */
  WRONG_ROUTE_ALERT: 30028,
  /** 该点位已打卡，请勿重复打卡 */
  DUPLICATE_CHECKIN: 30031,
  /** 登录失败次数过多，请稍后再试 */
  ADMIN_LOGIN_TOO_FREQUENTLY: 30032
} as const;
