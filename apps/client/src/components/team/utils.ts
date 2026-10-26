import type { WalkStatus } from "api/types/client";

import type { TeamMemberRole, TeamMemberType } from "./types";

export const ROUTE_OPTIONS = [
  { label: "屏峰半程", value: "pf-half" },
  { label: "屏峰全程", value: "pf-full" },
  { label: "莫干山全程", value: "mgs" }
] as const;

export type RouteName = (typeof ROUTE_OPTIONS)[number]["value"];

const MEMBER_TYPE_LABEL_MAP: Record<TeamMemberType, string> = {
  student: "学生",
  teacher: "教职工",
  alumni: "校友"
};

const MEMBER_ROLE_LABEL_MAP: Record<TeamMemberRole, string> = {
  captain: "队长",
  member: "队员",
  unbind: "未组队"
};

const WALK_STATUS_LABEL_MAP: Record<WalkStatus, string> = {
  // eslint-disable-next-line camelcase
  not_start: "未开始",
  pending: "待确认",
  abandoned: "已放弃",
  // eslint-disable-next-line camelcase
  in_progress: "进行中",
  withdrawn: "已退赛",
  violated: "违规",
  completed: "已完成"
};

export const isRouteName = (value: string): value is RouteName =>
  ROUTE_OPTIONS.some((option) => option.value === value);

export const getRouteLabel = (routeName: string) =>
  ROUTE_OPTIONS.find((option) => option.value === routeName)?.label ?? routeName;

export const getMemberTypeLabel = (type: TeamMemberType) => MEMBER_TYPE_LABEL_MAP[type];

export const getMemberRoleLabel = (role: TeamMemberRole) => MEMBER_ROLE_LABEL_MAP[role];

export const getWalkStatusLabel = (status: WalkStatus) => WALK_STATUS_LABEL_MAP[status];

export const sortMembersByCaptain = <T extends { role: TeamMemberRole }>(
  members: readonly T[]
): T[] =>
  members
    .map((member, index) => ({ member, index }))
    .toSorted((left, right) => {
      if (left.member.role === right.member.role) return left.index - right.index;
      if (left.member.role === "captain") return -1;
      if (right.member.role === "captain") return 1;
      return left.index - right.index;
    })
    .map(({ member }) => member);
