import type { PointId, SegmentKey } from "@/walk-config";

/** 数据仪表盘页的URL Query */
export type DashboardUrlQuery = {
  /** 当前选中的点位ID */
  point: PointId | "";
  /** 当前选中的行程段key */
  segment: SegmentKey | "";
};
