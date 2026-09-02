export const CLIENT_QUERY_KEY = {
  /** 用户相关 */
  USER: {
    /** 当前用户信息 */
    SELF: "userInfo"
  },
  /** 团队相关 */
  TEAM: {
    /** 团队详情 */
    DETAIL: "teamDetail",
    /** 团队页面基本信息 */
    OVERVIEW: "teamOverview",
    /** 队员详情 */
    MEMBER: "teamMember",
    /** 随机组队列表 */
    RANDOM_LIST: "randomTeamList"
  }
} as const;
