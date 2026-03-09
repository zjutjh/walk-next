export const ADMIN_QUERY_KEY = {
  /** 用户相关（示例） */
  USER: {
    /** 用户信息（示例） */
    INFO: "userInfo"
  },
  /** 数据仪表盘相关 */
  DASHBOARD: {
    /** 获取校区总数据 */
    OVERVIEW: "getCampusOverview",
    /** 获取点位详情 */
    POINT: "getPointDetails",
    /** 获取行程段详情 */
    SEGMENT: "getSegmentDetails"
  }
} as const;
