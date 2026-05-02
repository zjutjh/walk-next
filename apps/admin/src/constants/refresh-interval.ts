/** 数据刷新间隔（毫秒） */
export const ADMIN_REFRESH_INTERVAL = {
  /** 数据仪表盘 数据总览 */
  DASHBOARD: {
    /** 数据总览 */
    OVERVIEW: 30 * 1000,
    /** 获取点位详情 */
    POINT: 30 * 1000,
    /** 获取行程段详情 */
    SEGMENT: 30 * 1000
  }
} as const;
