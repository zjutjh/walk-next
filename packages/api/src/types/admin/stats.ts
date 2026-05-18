/** 总览中的路线代号与统计数据 */
export interface OverviewStatsRouteData {
  /** 路线代号 */
  route_name: string;
  /** 路线统计数据 */
  stats: RouteOverviewStat;
}

/** 总览中的路线统计数据 */
export interface RouteOverviewStat {
  /** 总报名人数 */
  total_reg: number;
  /** 未到场人数 */
  not_present: number;
  /** 待出发人数 */
  pending: number;
  /** 已出发人数 */
  started: number;
  /** 已结束人数（无论是否违规） */
  finished: number;
  /** 下撤人数 */
  withdrawn: number;
  /** 走错路线人数（走到另一条线路的人数） */
  wrong_route: number;
}

/** 路线统计数据 */
export interface RouteStat {
  /** 总报名人数 */
  total_reg: number;
  /** 未到场人数 */
  not_present: number;
  /** 待出发人数 */
  pending: number;
  /** 已出发人数 */
  started: number;
  /** 已结束人数（无论是否违规） */
  finished: number;
  /** 下撤人数 */
  withdrawn: number;
  /** 走错路线人数（走到另一条线路的人数） */
  wrong_route: number;
}

/** 点位统计数据 */
export interface PointStat {
  /** 点位代号 */
  point_name: string;
  /** 经过该点位的总人数 */
  passed_count: number;
}
