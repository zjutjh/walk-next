import type { RouteId } from "@/walk-config";

import { OVERVIEW_TAB_NAME } from "./constants";

/** 数据统计表格页的URL Query */
export type DataTableUrlQuery = {
  /** 标签页标识符 */
  tab: typeof OVERVIEW_TAB_NAME | RouteId;
};

/** 行程段统计数据 */
export interface SegmentStat {
  /** 点位代号 */
  segmentKey: string;
  /** 行程段的显示文本 */
  text: string;
  /** 经过该点位的总人数 */
  countOnSegment: number;
}
