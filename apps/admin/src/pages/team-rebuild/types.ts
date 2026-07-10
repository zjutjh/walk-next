import type { ActionSheetAction } from "vant";

import type { RouteId } from "@/walk-config";

/** 路线选择弹层的选项 */
export interface RoutePickerAction extends ActionSheetAction {
  routeId: RouteId;
}
