import type { RouteName } from "@/components/team/utils";

export type MatchValue = "false" | "true";

export type OpenedSelect = "" | "match" | "route";

export interface TeamFormRawValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: MatchValue | "";
  routeName: RouteName | "";
}

export interface TeamFormValue {
  name: string;
  slogan: string;
  password: string;
  allowMatch: boolean;
  routeName: RouteName;
}
