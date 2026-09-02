import type { TeamRandomListItem } from "api/types/client";

export interface RandomJoinRouteOption {
  name: RouteName;
  title: string;
  distanceKm: number;
}

export type RouteName = "pf-half" | "pf-full" | "mgs";

export type RandomJoinTeam = TeamRandomListItem;
