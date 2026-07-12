export const ADMIN_QUERY_KEY = {
  /** 用户相关 */
  USER: {
    /** 用户信息 */
    SELF: "userInfo"
  },
  /** 团队相关 */
  TEAM: {
    /** 团队列表 */
    LIST: "teamList",
    /** 团队详情 */
    DETAILS: "teamDetails",
    /** 团队状态 */
    STATUS: "teamStatus"
  },
  /** 数据仪表盘相关 */
  DASHBOARD: {
    /** 获取校区总数据 */
    OVERVIEW: "campusOverview",
    /** 获取点位详情 */
    POINT: "pointDetails",
    /** 获取行程段详情 */
    SEGMENT: "segmentDetails"
  },
  /** 统计数据相关 */
  STATS: {
    /** 总览 */
    OVERVIEW: "overviewStats",
    /** 单路线 */
    ROUTE: "routeStats"
  }
} as const;
