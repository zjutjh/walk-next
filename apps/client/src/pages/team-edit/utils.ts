import type { QueryTeamDetailResponse } from "api/types/client";

import type { RouteName, TeamEditFormRawValue } from "./types";

const ROUTE_LABEL_MAP: Record<RouteName, string> = {
  "pf-half": "屏峰半程",
  "pf-full": "屏峰全程",
  mgs: "莫干山全程"
};

export const isRouteName = (value: string): value is RouteName => value in ROUTE_LABEL_MAP;

export const getRouteLabel = (routeName: string) => {
  if (!isRouteName(routeName)) return routeName;
  return ROUTE_LABEL_MAP[routeName];
};

export function buildInitialFormValue(team?: QueryTeamDetailResponse): TeamEditFormRawValue {
  const routeName = team?.route_name ?? "";

  let allowMatch: TeamEditFormRawValue["allowMatch"] = "";
  if (team) {
    allowMatch = team.allow_match ? "true" : "false";
  }

  return {
    name: team?.name ?? "",
    slogan: team?.slogan ?? "",
    password: team?.password ?? "",
    allowMatch,
    routeName: isRouteName(routeName) ? routeName : ""
  };
}
