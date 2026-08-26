import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/vue-query";
import { watchImmediate } from "@vueuse/core";
import type { QueryUserInfoResponse } from "api/types/client";
import { isNil, merge } from "lodash-es";
import { defineStore } from "pinia";
import type { PartialDeep, SimplifyDeep } from "type-fest";
import { getCurrentScope, onScopeDispose, ref, toRef } from "vue";

import { CLIENT_QUERY_KEY } from "@/constants";
import { CLIENT_PINIA_PERSIST_KEY } from "@/constants/pinia-persist-key";
import { walkClientService } from "@/utils";

export interface ClientUserData {
  isLoggedIn: boolean;
  jwt: string;
  userInfo?: QueryUserInfoResponse;
}

/** 当前用户信息查询配置 */
export const CLIENT_USER_INFO_QUERY_OPTIONS = queryOptions({
  queryKey: [CLIENT_QUERY_KEY.USER.SELF] as const,
  queryFn: () => walkClientService.QueryUserInfo(),
  staleTime: Infinity
});

/** 客户端用户数据 Store */
const useClientUserDataStore = defineStore(
  "clientUserData",
  () => {
    const data = ref(buildDefaultClientUserData());
    const isQueryExist = ref(false);

    return {
      data,
      isQueryExist
    };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.CLIENT_USER_DATA,
      pick: ["data"]
    }
  }
);

/**
 * 客户端用户数据
 */
export const useClientUserData = (queryClient: QueryClient = useQueryClient()) => {
  const userDataStore = useClientUserDataStore();

  /** 是否已登录 */
  const isLoggedIn = toRef(() => userDataStore.data.isLoggedIn);
  /** 系统 JWT */
  const jwt = toRef(() => userDataStore.data.jwt);
  /** 当前用户信息 */
  const clientUserInfo = toRef(() => userDataStore.data.userInfo);

  const updateClientUserData = (patch: SimplifyDeep<PartialDeep<ClientUserData>>) => {
    merge(userDataStore.data, patch);
    queryClient.setQueryData<QueryUserInfoResponse>(
      [CLIENT_QUERY_KEY.USER.SELF],
      () => userDataStore.data.userInfo ?? undefined
    );
  };

  /** 登录成功后更新用户数据 */
  const updateClientLoginData = (jwtValue: string) => {
    updateClientUserData({
      isLoggedIn: true,
      jwt: jwtValue
    });
  };

  /** 重置当前用户数据 */
  const resetClientUserData = () => {
    updateClientUserData(buildDefaultClientUserData());
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.USER.SELF] });
  };

  /** 启动 query，需要在顶层组件调用 */
  const setupClientUserDataQuery = () => {
    if (!getCurrentScope()) {
      throw new Error("Function 'setupClientUserDataQuery' must be called in Vue effectScope.");
    }
    // 防止重复启动 query
    if (userDataStore.isQueryExist) return;

    const { data } = useQuery({
      ...CLIENT_USER_INFO_QUERY_OPTIONS,
      enabled: () => isLoggedIn.value
    });

    watchImmediate(data, (newData) => {
      if (isNil(newData)) return;
      updateClientUserData({
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
    jwt,
    clientUserInfo,
    updateClientUserData,
    updateClientLoginData,
    resetClientUserData,
    setupClientUserDataQuery
  };
};

/** 客户端用户数据空值 */
function buildDefaultClientUserData(): ClientUserData {
  return {
    isLoggedIn: false,
    jwt: ""
  };
}
