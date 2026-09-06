import { QueryClient, queryOptions, useQuery, useQueryClient } from "@tanstack/vue-query";
import { watchImmediate } from "@vueuse/core";
import type { QueryUserInfoResponse } from "api/types/client";
import { isNil } from "lodash-es";
import { defineStore, storeToRefs } from "pinia";
import { computed, getCurrentScope, onScopeDispose, ref } from "vue";

import { CLIENT_PINIA_PERSIST_KEY, CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

const useClientUserDataStore = defineStore(
  "clientUserData",
  () => {
    const jwt = ref("");
    const userInfo = ref<QueryUserInfoResponse>();
    const isQueryExist = ref(false);
    const isLoggedIn = computed(() => Boolean(jwt.value));

    return {
      jwt,
      userInfo,
      isQueryExist,
      isLoggedIn
    };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.CLIENT_USER_DATA,
      pick: ["jwt", "userInfo"]
    }
  }
);

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

  const syncQueryData = () => {
    queryClient.setQueryData<QueryUserInfoResponse>(
      [CLIENT_QUERY_KEY.USER.SELF],
      () => clientUserInfo.value ?? undefined
    );
  };

  const updateUserInfo = (data: QueryUserInfoResponse) => {
    userDataStore.userInfo = data;
    syncQueryData();
  };

  /** 登录成功后更新 JWT */
  const updateClientLoginData = (jwtValue: string) => {
    userDataStore.jwt = jwtValue;
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
    if (userDataStore.isQueryExist) return;

    const { data } = useQuery({
      ...CLIENT_USER_INFO_QUERY_OPTIONS,
      enabled: () => isLoggedIn.value
    });

    watchImmediate(data, (newData) => {
      if (isNil(newData)) return;
      updateUserInfo(newData);
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
    updateClientLoginData,
    updateUserInfo,
    resetClientUserData,
    setupClientUserDataQuery
  };
};
