import { QueryClient, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AdminAPI, PermissionLevel } from "api/types/admin";
import { assign, isNil } from "lodash-es";
import { defineStore } from "pinia";
import { getCurrentScope, onScopeDispose, ref, toRef, watch } from "vue";

import { ADMIN_QUERY_KEY } from "@/constants";
import { ADMIN_PINIA_PERSIST_KEY } from "@/constants/pinia-persist-key";
import { walkAdminService } from "@/utils";

export interface AdminUserInfo {
  isLoggedIn: boolean;
  adminName: string;
  pointId: string;
  campusId: string;
  permissionLevel: PermissionLevel;
}

/** 管理员用户信息空值 */
const buildDefaultAdminUserInfo = (): AdminUserInfo => ({
  isLoggedIn: false,
  adminName: "",
  pointId: "",
  campusId: "",
  permissionLevel: "external"
});

/** 管理员用户信息Store */
const useAdminStore = defineStore(
  "adminUserInfo",
  () => {
    const data = ref(buildDefaultAdminUserInfo());
    const isQueryExist = ref(false);

    return {
      data,
      isQueryExist
    };
  },
  {
    persist: {
      key: ADMIN_PINIA_PERSIST_KEY.ADMIN_USER_INFO,
      pick: ["data"]
    }
  }
);

/** 权限等级的权值（用于创建自增数字，不直接消费） */
const enum PermissionWeight {
  EXTERNAL,
  INTERNAL,
  MANAGER,
  SUPER
}

/** 权限等级-权值 映射表 */
const PERMISSION_WEIGHT_MAP = {
  external: PermissionWeight.EXTERNAL,
  internal: PermissionWeight.INTERNAL,
  manager: PermissionWeight.MANAGER,
  super: PermissionWeight.SUPER
} as const satisfies Record<PermissionLevel, PermissionWeight>;

/** 管理员用户信息
 * @param queryClient Tanstack Query的QueryClient实例，EffectScope外调用必须传入
 */
export const useAdminInfo = (queryClient: QueryClient = useQueryClient()) => {
  const adminStore = useAdminStore();

  const isLoggedIn = toRef(() => adminStore.data.isLoggedIn);
  const adminName = toRef(() => adminStore.data.adminName);
  const adminPointId = toRef(() => adminStore.data.pointId);
  const adminCampusId = toRef(() => adminStore.data.campusId);
  const permissionLevel = toRef(() => adminStore.data.permissionLevel);

  /** 检查当前用户是否达到指定权限等级 */
  const hasPermission = (targetLevel: PermissionLevel | undefined) => {
    if (isNil(targetLevel)) return true;
    return PERMISSION_WEIGHT_MAP[permissionLevel.value] >= PERMISSION_WEIGHT_MAP[targetLevel];
  };

  /** 以patch方式更新当前用户信息 */
  const updateAdminInfo = (patch: Partial<AdminUserInfo>) => {
    assign(adminStore.data, patch);
    // 更新query缓存
    queryClient.setQueryData<AdminAPI.QueryAdminUserInfoResponse>(
      [ADMIN_QUERY_KEY.USER.SELF],
      () => ({
        name: adminName.value,
        point_name: adminPointId.value,
        campus: adminCampusId.value,
        permission: permissionLevel.value
      })
    );
  };

  /** 重置当前用户信息 */
  const resetAdminInfo = () => {
    updateAdminInfo(buildDefaultAdminUserInfo());
    // 清理query缓存
    queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY.USER.SELF] });
  };

  /** 启动query，需要在顶层组件调用 */
  const setupAdminInfoQuery = () => {
    if (!getCurrentScope()) {
      throw new Error("Function 'setupAdminInfoQuery' must be called in Vue effectScope.");
    }
    // 防止重复启动query
    if (adminStore.isQueryExist) return;
    adminStore.isQueryExist = true;
    onScopeDispose(() => {
      adminStore.isQueryExist = false;
    });
    // 获取管理员用户信息
    const { data } = useQuery({
      enabled: () => isLoggedIn.value,
      queryKey: [ADMIN_QUERY_KEY.USER.SELF] as const,
      queryFn: () => walkAdminService.QueryAdminUserInfo(undefined),
      staleTime: Infinity
    });
    // 获取成功后更新Store
    watch(
      data,
      (newData) => {
        if (isNil(newData)) return;
        updateAdminInfo({
          adminName: newData.name,
          pointId: newData.point_name,
          campusId: newData.campus,
          permissionLevel: newData.permission
        });
      },
      { immediate: true }
    );
  };

  return {
    isLoggedIn,
    adminName,
    adminPointId,
    adminCampusId,
    hasPermission,
    permissionLevel,
    updateAdminInfo,
    resetAdminInfo,
    setupAdminInfoQuery
  };
};
