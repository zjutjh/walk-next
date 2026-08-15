import { QueryClient, useQuery, useQueryClient } from "@tanstack/vue-query";
import { watchImmediate } from "@vueuse/core";
import type { AdminAPI, PermissionLevel } from "api/types/admin";
import { isNil, merge } from "lodash-es";
import { defineStore } from "pinia";
import type { PartialDeep, SimplifyDeep } from "type-fest";
import { computed, getCurrentScope, onScopeDispose, ref, toRef } from "vue";

import { ADMIN_QUERY_KEY } from "@/constants";
import { ADMIN_PINIA_PERSIST_KEY } from "@/constants/pinia-persist-key";
import { walkAdminService } from "@/utils";

export interface AdminUserData {
  isLoggedIn: boolean;
  userInfo: AdminAPI.QueryAdminUserInfoResponse | null;
}

/** 管理员用户数据空值 */
const buildDefaultAdminUserData = (): AdminUserData => ({
  isLoggedIn: false,
  userInfo: null
});

/** 管理员用户数据Store */
const useAdminUserDataStore = defineStore(
  "adminUserData",
  () => {
    const data = ref(buildDefaultAdminUserData());
    const isQueryExist = ref(false);

    return {
      data,
      isQueryExist
    };
  },
  {
    persist: {
      key: ADMIN_PINIA_PERSIST_KEY.ADMIN_USER_DATA,
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

/** 管理员用户数据
 * @param queryClient Tanstack Query的QueryClient实例，EffectScope外调用必须传入
 */
export const useAdminUserData = (queryClient: QueryClient = useQueryClient()) => {
  const userDataStore = useAdminUserDataStore();

  /** 是否已登录 */
  const isLoggedIn = toRef(() => userDataStore.data.isLoggedIn);
  /** 管理员用户信息 */
  const adminUserInfo = computed(() => {
    const rawUserInfo = userDataStore.data.userInfo;
    if (isNil(rawUserInfo)) return null;
    return {
      adminName: rawUserInfo.name,
      pointId: rawUserInfo.point_name,
      campusId: rawUserInfo.campus,
      permissionLevel: rawUserInfo.permission
    };
  });

  /** 检查当前用户是否达到指定权限等级 */
  const hasPermission = (targetLevel: PermissionLevel | undefined) => {
    if (isNil(targetLevel)) return true;
    if (isNil(adminUserInfo.value)) return false;
    return (
      PERMISSION_WEIGHT_MAP[adminUserInfo.value.permissionLevel] >=
      PERMISSION_WEIGHT_MAP[targetLevel]
    );
  };

  /** 以patch方式更新当前用户数据 */
  const updateAdminUserData = (patch: SimplifyDeep<PartialDeep<AdminUserData>>) => {
    merge(userDataStore.data, patch);
    // 更新query缓存
    queryClient.setQueryData<AdminAPI.QueryAdminUserInfoResponse>(
      [ADMIN_QUERY_KEY.USER.SELF],
      () => userDataStore.data.userInfo ?? undefined
    );
  };

  /** 重置当前用户数据 */
  const resetAdminUserData = () => {
    updateAdminUserData(buildDefaultAdminUserData());
    // 清理query缓存
    queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY.USER.SELF] });
  };

  /** 启动query，需要在顶层组件调用 */
  const setupAdminUserDataQuery = () => {
    if (!getCurrentScope()) {
      throw new Error("Function 'setupAdminUserDataQuery' must be called in Vue effectScope.");
    }
    // 防止重复启动query
    if (userDataStore.isQueryExist) return;

    // 获取管理员用户数据
    const { data } = useQuery({
      enabled: () => isLoggedIn.value,
      queryKey: [ADMIN_QUERY_KEY.USER.SELF] as const,
      queryFn: () => walkAdminService.QueryAdminUserInfo(undefined),
      staleTime: Infinity
    });
    // 获取成功后更新Store
    watchImmediate(data, (newData) => {
      if (isNil(newData)) return;
      updateAdminUserData({
        userInfo: newData
      });
    });

    userDataStore.isQueryExist = true;
    onScopeDispose(() => {
      userDataStore.isQueryExist = false;
    });
  };

  return {
    isLoggedIn,
    adminUserInfo,
    hasPermission,
    updateAdminUserData,
    resetAdminUserData,
    setupAdminUserDataQuery
  };
};
