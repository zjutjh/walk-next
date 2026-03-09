import type { TeamMemberRole } from "api/types/admin";

/** 队伍成员角色的中文名 */
export const TEAM_MEMBER_ROLE_TEXT = {
  captain: "队长",
  member: "队员"
} as const satisfies Record<TeamMemberRole, string>;
