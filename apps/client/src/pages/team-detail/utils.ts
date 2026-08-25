import type { RouteName, TeamMemberRole, TeamMemberType, TeamMemberWalkStatus } from "./types";

const ROUTE_LABEL_MAP: Record<RouteName, string> = {
  "pf-half": "屏峰半程",
  "pf-full": "屏峰全程",
  mgs: "莫干山全程"
};

const MEMBER_TYPE_LABEL_MAP: Record<TeamMemberType, string> = {
  student: "学生",
  teacher: "教职工",
  alumnus: "校友"
};

const MEMBER_ROLE_LABEL_MAP: Record<TeamMemberRole, string> = {
  captain: "队长",
  member: "队员",
  unbind: "未组队"
};

const WALK_STATUS_LABEL_MAP: Record<TeamMemberWalkStatus, string> = {
  not_start: "未开始",
  pending: "待确认",
  abandoned: "已放弃",
  in_progress: "进行中",
  withdrawn: "已退赛",
  violated: "违规",
  completed: "已完成"
};

const TEAM_STATUS_LABEL_MAP: Partial<Record<string, string>> = {
  not_start: "未开始",
  pending: "待确认",
  abandoned: "已放弃",
  in_progress: "进行中",
  withdrawn: "已退赛",
  violated: "违规",
  completed: "已完成"
};

export const isRouteName = (value: string): value is RouteName => value in ROUTE_LABEL_MAP;

export const getRouteLabel = (routeName: string) => {
  if (!isRouteName(routeName)) return routeName;
  return ROUTE_LABEL_MAP[routeName];
};

export const getMemberTypeLabel = (type: TeamMemberType) => MEMBER_TYPE_LABEL_MAP[type];

export const getMemberRoleLabel = (role: TeamMemberRole) => MEMBER_ROLE_LABEL_MAP[role];

export const getWalkStatusLabel = (status: TeamMemberWalkStatus) => WALK_STATUS_LABEL_MAP[status];

export const getTeamStatusLabel = (status: string) => TEAM_STATUS_LABEL_MAP[status] ?? status;
