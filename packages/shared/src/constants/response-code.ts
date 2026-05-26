/** 业务状态码 */
export const RESP_CODE = {
  OK: 200,
  /** 未知错误 */
  UNKNOWN_ERROR: 20000,
  /** 数据库错误 */
  DATABASE_ERROR: 20001,
  /** 中间件服务错误 */
  MIDDLEWARE_SERVICE_ERROR: 20002,
  /** 用户未登录 */
  NOT_LOGGED_IN: 20003,
  /** 用户无权限 */
  PERMISSION_DENIED: 20004,
  /** 参数错误 */
  PARAMETER_INVALID: 20005,
  /** 数据不存在 */
  DATA_NOT_FOUND: 20006,
  /** 数据冲突 */
  DATA_CONFLICT: 20007,
  /** 操作过于频繁/未获得锁 */
  TOO_FREQUENTLY: 20008,
  /** 参数不足 */
  INSUFFICIENT_PARAMS: 20009,
  /** 该身份信息已报名 */
  ALREADY_REGISTERED: 20010,
  /** 统一身份验证失败 */
  OAUTH_FAILED: 20011,
  /** 已在团队中 */
  ALREADY_IN_TEAM: 20012,
  /** 团队人数已满 */
  TEAM_FULL: 20013,
  /** 尚未加入团队 */
  NOT_IN_TEAM: 20014,
  /** 仅队长可操作 */
  NOT_CAPTAIN: 20015,
  /** 创建团队次数已用完 */
  NO_CREATE_CHANCE: 20016,
  /** 加入团队次数已用完 */
  NO_JOIN_CHANCE: 20017,
  /** 团队已提交，无法操作 */
  TEAM_SUBMITTED: 20018,
  /** 团队名称已存在 */
  TEAM_NAME_DUPLICATED: 20019,
  /** 密码错误 */
  PASSWORD_WRONG: 20020,
  /** 团队人数不足 */
  TEAM_NOT_ENOUGH: 20021,
  /** OpenID为空 */
  OPEN_ID_EMPTY: 20022,
  /** 微信Code缺失 */
  WECHAT_CODE_MISSING: 20023,
  /** 账号或密码错误 */
  ACCOUNT_OR_PASSWORD_ERROR: 20024,
  /** 团队不存在 */
  TEAM_NOT_FOUND: 20025,
  /** 该用户没有名额 */
  USER_NO_QUOTA: 20026,
  /** 签到码绑定失败 */
  BIND_CODE_ERROR: 20027,
  /** 人员不存在 */
  PEOPLE_NOT_FOUND: 20028,
  /** 校区错误 */
  CAMPUS_MISMATCH: 20029,
  /** 该团队已完成，无法进行点位打卡 */
  TEAM_CHECKIN_CLOSED: 20030,
  /** 上一签到点并非路线前序点位 */
  PREV_POINT_INVALID: 20031,
  /** 该团队路线走错，请立即提醒 */
  WRONG_ROUTE_ALERT: 20032,
  /** 该点位已打卡，请勿重复打卡 */
  DUPLICATE_CHECKIN: 20033,
  /** 登录失败次数过多，请稍后再试 */
  ADMIN_LOGIN_TOO_FREQUENTLY: 20034,
  /** 该队方向错误，请立即提醒调转方向并且拒绝打卡 */
  CODE_TEAM_DIRECTION_INVALID: 20035
} as const;
