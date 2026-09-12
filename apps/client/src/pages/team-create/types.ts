export interface CreateSelectOption {
  label: string;
  value: string;
}

export type MatchValue = "false" | "true";

export type RouteName = "pf-half" | "pf-full" | "mgs";

export type OpenedSelect = "" | "match" | "route";

export interface CreateTeamFormValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: boolean;
  routeName: RouteName;
}
