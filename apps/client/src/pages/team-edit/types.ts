export type RouteName = "pf-half" | "pf-full" | "mgs";

export type MatchValue = "false" | "true";

export type OpenedTeamEditSelect = "" | "match" | "route";

export interface TeamEditFormRawValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: MatchValue | "";
  routeName: RouteName | "";
}

export interface TeamEditFormValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: boolean;
  routeName: RouteName;
}
