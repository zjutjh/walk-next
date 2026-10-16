import type { TeamRandomListItem } from "api/types/client";

import type { RouteName } from "@/components/team/utils";

export interface RandomJoinRouteOption {
  name: RouteName;
  title: string;
  distanceKm: number;
}

export type RandomJoinTeam = TeamRandomListItem;
