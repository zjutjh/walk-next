import type { MemberWalkStatus } from "api/types/admin";

/** 人员行进状态-CSS颜色 映射表 */
export const MEMBER_WALK_STATUS_COLOR_MAP = {
  not_start: "var(--van-gray-5)",
  pending: "#addf17",
  in_progress: "var(--van-green)",
  abandoned: "var(--van-gray-7)",
  withdrawn: "var(--van-blue)",
  completed: "var(--van-black)"
} satisfies Record<MemberWalkStatus, string>;
