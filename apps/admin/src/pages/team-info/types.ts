import type { WalkerStatus } from "api/types/admin";
import type { SetRequired } from "type-fest";
import type { ActionSheetAction } from "vant";

/** 成员状态编辑弹层的选项 */
export interface StatusPickerAction extends SetRequired<ActionSheetAction, "color"> {
  status: WalkerStatus;
}
