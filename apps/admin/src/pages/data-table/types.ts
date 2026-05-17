import type { CampusId } from "@/walk-config";

import { OVERVIEW_TAB_NAME } from "./constants";

/** 数据统计表格页的URL Query */
export type DataTableUrlQuery = {
  /** 标签页标识符 */
  tab: typeof OVERVIEW_TAB_NAME | CampusId;
};
