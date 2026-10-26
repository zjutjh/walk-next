import { whenever } from "@vueuse/core";
import type { QueryTeamOverviewResponse } from "api/types/client";
import type { Ref } from "vue";

import { useClientUserData } from "./client-user-data";

/**
 * 用队伍概览校正当前用户身份。
 *
 * 身份可能在别的设备上变更（队长移交、被移出队伍），本地用户信息缓存常驻不会再请求，
 * 而 overview 每次进页面都会重新拉取；一旦发现自己在队伍里的身份与缓存不一致就刷新用户信息，
 * 让权限按钮和 allowedRoles 路由守卫跟上，不必刷新整页。
 */
export const useTeamRoleSync = (overview: Ref<QueryTeamOverviewResponse | undefined>) => {
  const { clientUserInfo, refreshUserInfo } = useClientUserData();

  whenever(overview, (data) => {
    const selfRole = data.members.find((member) => member.id === clientUserInfo.value?.id)?.role;
    if (selfRole && selfRole !== clientUserInfo.value?.role) void refreshUserInfo();
  });
};
