export interface TeamRandomListItem extends TeamSummary {
  /** 团队人数 */
  num: number;
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
