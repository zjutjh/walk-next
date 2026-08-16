import { QueryClient, useQuery, useQueryClient } from "@tanstack/vue-query";
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
  userInfo: QueryUserInfoResponse | null;
}

/** 客户端用户数据空值 */
const buildDefaultClientUserData = (): ClientUserData => ({
  isLoggedIn: false,
  jwt: "",
  userInfo: null
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
  const updateClientLoginData = (loginData: { jwt: string; userInfo: QueryUserInfoResponse }) => {
    updateClientUserData({
      isLoggedIn: true,
      jwt: loginData.jwt,
      userInfo: loginData.userInfo
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
      enabled: () => isLoggedIn.value,
      queryKey: [CLIENT_QUERY_KEY.USER.SELF] as const,
      queryFn: () => walkClientService.QueryUserInfo(undefined),
      staleTime: Infinity
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
