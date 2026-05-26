import type { WalkerStatus } from "api/types/admin";
import { mapValues } from "lodash-es";

import { WALKER_STATUS_TEXT } from "@/constants";

import type { StatusPickerAction } from "./types";

/** 人员状态-CSS颜色 映射表 */
export const STATUS_COLOR_MAP = {
  not_start: "var(--van-gray-5)",
  pending: "var(--van-warning-color)",
  in_progress: "var(--van-green)",
  abandoned: "var(--van-gray-7)",
  withdrawn: "var(--van-blue)",
  violated: "var(--van-danger-color)",
  completed: "var(--van-black)"
} satisfies Record<WalkerStatus, string>;

/** 人员状态-状态选择器选项配置 映射表（导出） */
export const STATUS_PICKER_ACTION_MAP = mapValues(STATUS_COLOR_MAP, (color, key) => {
  const status = key as WalkerStatus;
  return {
    status: status,
    name: WALKER_STATUS_TEXT[status],
    color: color
  } satisfies StatusPickerAction;
});
