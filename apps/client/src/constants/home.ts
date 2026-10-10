import type { UserHome } from "api/types/client";

/** 户籍选项 */
export const HOME_OPTIONS = [
  { label: "中国大陆", value: "mainland" },
  { label: "港澳", value: "hong_kong_macao" },
  { label: "台湾", value: "taiwan" },
  { label: "境外", value: "international" }
] as const satisfies readonly { label: string; value: UserHome }[];
