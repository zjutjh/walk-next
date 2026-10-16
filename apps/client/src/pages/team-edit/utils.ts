import type { QueryTeamDetailResponse } from "api/types/client";

import { isRouteName } from "@/components/team/utils";
import type { TeamFormRawValue } from "@/components/team-form/types";

export function buildInitialFormValue(team?: QueryTeamDetailResponse): TeamFormRawValue {
  const routeName = team?.route_name ?? "";

  let allowMatch: TeamFormRawValue["allowMatch"] = "";
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
