import WalkClientService from "api/services/client";
import { type CommonRespWrap, type ServiceOptions } from "api/utils";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { RequestError, RESP_CODE } from "shared";
import { showToast } from "vant";

import { useClientUserData } from "@/composables";
import { globalQueryClient } from "@/configs/vue-query";

const SERVICE_TIMEOUT = 15000 as const;

const axiosInstance = axios.create({ timeout: SERVICE_TIMEOUT });
let isHandlingAuthExpired = false;

const redirectToLogin = async () => {
  const { routerInstance } = await import("@/configs/router");
  const currentRoute = routerInstance.currentRoute.value;

  if (currentRoute.name === "login") return;

  await routerInstance.replace({
    name: "login",
    query: {
      fromPath: encodeURIComponent(currentRoute.fullPath)
    }
  });
};

const handleAuthExpired = (code: number) => {
  useClientUserData(globalQueryClient).resetClientUserData();

  if (isHandlingAuthExpired) return;

  isHandlingAuthExpired = true;

  showToast({
    message: code === RESP_CODE.NOT_LOGGED_IN ? "未登录" : "登录过期，请重新登录",
    position: "bottom"
  });

  void redirectToLogin().finally(() => {
    isHandlingAuthExpired = false;
  });
};

axiosInstance.interceptors.response.use(
  (response) => {
    const body: CommonRespWrap<unknown> = response.data;

    if (body.code !== RESP_CODE.OK) {
      switch (body.code) {
        // 未登录或登录过期
        case RESP_CODE.NOT_LOGGED_IN:
        case RESP_CODE.LOGIN_EXPIRED:
          handleAuthExpired(body.code);
          throw new RequestError("登录过期，请重新登录", body.code);

        case RESP_CODE.DATA_PARSE_ERROR:
          handleAuthExpired(RESP_CODE.LOGIN_EXPIRED);
          throw new RequestError("登录过期，请重新登录", RESP_CODE.LOGIN_EXPIRED);

        default:
          throw new RequestError(body.message, body.code);
      }
    }
    return response;
  },
  (axiosErr: AxiosError) => {
    if (axiosErr.response?.status === 401) {
      handleAuthExpired(RESP_CODE.LOGIN_EXPIRED);
      throw new RequestError("登录过期，请重新登录", RESP_CODE.LOGIN_EXPIRED);
    }

    throw RequestError.fromAxiosError(axiosErr);
  }
);

export const request: ServiceOptions<AxiosRequestConfig>["request"] = async (req, options) => {
  const { jwt } = useClientUserData(globalQueryClient);

  const { data: body } = await axiosInstance({
    url: req.url,
    method: req.method,
    params: req.params,
    data: req.data,
    ...options,
    headers: {
      ...(jwt.value ? { Authorization: `Bearer ${jwt.value}` } : {}),
      ...options?.headers
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (body as CommonRespWrap<any>).data;
};

export const walkClientService = new WalkClientService({
  request,
  baseURL: "/api"
});
