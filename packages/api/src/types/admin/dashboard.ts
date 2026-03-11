/** 数据仪表盘路线总览信息 */
export interface DashboardRoutesRes {
  /** 路线ID */
  route_name?: string;
  /** 总报名人数 */
  total_reg?: number;
  /** 进行中人数 */
  walking?: number;
  /**  到达终点人数（无论是否违规） */
  finished?: number;
  /** 走错路线人数 */
  wrong_route?: number;
}
