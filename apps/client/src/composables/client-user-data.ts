import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/vue-query";
import { watchImmediate } from "@vueuse/core";
import type { QueryUserInfoResponse } from "api/types/client";
import { isNil, merge } from "lodash-es";
import { storeToRefs } from "pinia";
import type { PartialDeep, SimplifyDeep } from "type-fest";
import { getCurrentScope, onScopeDispose } from "vue";

import { CLIENT_QUERY_KEY } from "@/constants";
import { useClientUserDataStore } from "@/store/client-user-data";
import { walkClientService } from "@/utils";

export interface ClientUserData {
  isLoggedIn: boolean;
  jwt: string;
  userInfo?: QueryUserInfoResponse;
}

const CLIENT_USER_DATA_DEFAULT: ClientUserData = {
  isLoggedIn: false,
  jwt: ""
};

/** 当前用户信息查询配置 */
export const CLIENT_USER_INFO_QUERY_OPTIONS = queryOptions({
  queryKey: [CLIENT_QUERY_KEY.USER.SELF] as const,
  queryFn: () => walkClientService.QueryUserInfo(),
  staleTime: Infinity
});

/**
 * 客户端用户数据
 */
export const useClientUserData = (queryClient: QueryClient = useQueryClient()) => {
  const userDataStore = useClientUserDataStore();
  const { isLoggedIn, jwt, userInfo: clientUserInfo } = storeToRefs(userDataStore);

  const syncClientUserInfoQueryData = () => {
    queryClient.setQueryData<QueryUserInfoResponse>(
      [CLIENT_QUERY_KEY.USER.SELF],
      () => clientUserInfo.value ?? undefined
    );
  };

  const updateClientUserData = (patch: SimplifyDeep<PartialDeep<ClientUserData>>) => {
    const nextUserData = merge(
      {
        ...CLIENT_USER_DATA_DEFAULT,
        userInfo: clientUserInfo.value
      },
      {
        isLoggedIn: isLoggedIn.value,
        jwt: jwt.value
      },
      patch
    );

    userDataStore.jwt = patch.isLoggedIn === false ? "" : nextUserData.jwt;
    userDataStore.userInfo = nextUserData.userInfo;
    syncClientUserInfoQueryData();
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
    userDataStore.jwt = "";
    userDataStore.userInfo = undefined;
    queryClient.clear();
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
