export const ADMIN_QUERY_KEY = {
  /** 用户相关（示例） */
  USER: {
    /** 用户信息（示例） */
    INFO: "userInfo"
  },
  /** 团队相关 */
  TEAM: {
    /** 团队列表 */
    LIST: "teamList",
    /** 团队详情 */
    DETAILS: "teamDetails"
  }
} as const;
