export const ADMIN_QUERY_KEY = {
  /** 用户相关（示例） */
  USER: {
    /** 用户信息（示例） */
    INFO: "userInfo"
  },
  /** 队伍相关 */
  TEAM: {
    /** 队伍列表 */
    LIST: "teamList",
    /** 队伍详情 */
    DETAILS: "teamDetails"
  }
} as const;
