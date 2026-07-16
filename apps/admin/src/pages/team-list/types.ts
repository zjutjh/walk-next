import type { SearchType } from "api/types/admin";

import type { SegmentKey } from "@/walk-config";

/** 搜索团队页的URL Query */
export interface TeamListUrlQuery {
  /** 搜索词 */
  keyword: string;
  /** 搜索类型 */
  searchType: SearchType;
  /** 行程段筛选 */
  segment: SegmentKey | "";
  /** 正在查看详情的团队的ID */
  viewingTeam: number;
}
