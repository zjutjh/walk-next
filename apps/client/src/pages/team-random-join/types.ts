import type { TeamRandomListItem } from "api/types/client";

export interface RandomJoinRouteOption {
  name: RouteName;
  title: string;
  distanceKm: number;
}

export interface RandomJoinTeamFilterOption {
  value: TeamFilter;
  label: string;
}

export type RouteName = "pf-half" | "pf-full" | "mgs";

export type TeamFilter = "all";

export type RandomJoinTeam = TeamRandomListItem;
