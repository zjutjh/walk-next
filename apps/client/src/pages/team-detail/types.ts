import type { UserRole, UserType, UserWalkStatus } from "api/types/client";

export type TeamDetailView = "overview" | "basic-detail";

export type RouteName = "pf-half" | "pf-full" | "mgs";

export type MatchValue = "false" | "true";

export type OpenedTeamEditSelect = "" | "match" | "route";

export interface TeamEditSelectOption {
  label: string;
  value: string;
}

export interface TeamEditFormValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: boolean;
  routeName: RouteName;
}

export type TeamMemberRole = UserRole;

export type TeamMemberType = UserType;

export type TeamMemberWalkStatus = UserWalkStatus;
