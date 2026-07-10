import type { MemberWalkStatus } from "api/types/admin";
import { mapValues } from "lodash-es";

import { WALKER_STATUS_TEXT } from "@/constants";
import { MEMBER_STATUS_COLOR_MAP } from "@/constants/member-status-config";
import type { StatusPickerAction } from "@/pages/team-info/types";

/** 人员状态-状态选择器选项配置 映射表（导出） */
export const STATUS_PICKER_ACTION_MAP = mapValues(MEMBER_STATUS_COLOR_MAP, (color, key) => {
  const status = key as MemberWalkStatus;
  return {
    status: status,
    name: WALKER_STATUS_TEXT[status],
    color: color
  } satisfies StatusPickerAction;
});
