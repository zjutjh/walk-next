export interface TeamRandomListItem {
  /** 团队人数 */
  num: number;
  /** ID */
  id: number;
  /** 队名 */
  name: string;
  /** 所选路线 */
  route_name: string;
  /** 队伍标语 */
  slogan: string;
}

export interface TeamSummary {
  /** ID */
  id: number;
  /** 队名 */
  name: string;
  /** 所选路线 */
  route_name: string;
  /** 队伍标语 */
  slogan: string;
}

export interface TeamQuotaRouteItem {
  /** 当前是否还有队伍名额 */
  available: boolean;
  /** 路线代码 */
  route_name: string;
}
