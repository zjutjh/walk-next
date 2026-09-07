import WalkClientService from "api/services/client";
import { type CommonRespWrap, type ServiceOptions } from "api/utils";
import axios, { type AxiosRequestConfig } from "axios";
import { RequestError, RESP_CODE } from "shared";
import { showToast } from "vant";

import { useClientUserData } from "@/composables";
import { globalQueryClient } from "@/configs/vue-query";

const SERVICE_TIMEOUT = 15000 as const;

const axiosInstance = axios.create({ timeout: SERVICE_TIMEOUT });
let isRedirecting = false;

const redirectTo = async (name: string, query?: Record<string, string>) => {
  const { routerInstance } = await import("@/configs/router");
  const currentRoute = routerInstance.currentRoute.value;

  if (currentRoute.name === name) return;

  await routerInstance.replace({ name, query });
};

const handleRedirect = (
  name: string,
  message: string,
  getQuery?: () => Record<string, string> | Promise<Record<string, string>>,
  resetUserData = false
) => {
  if (isRedirecting) return;
  isRedirecting = true;

  if (resetUserData) {
    useClientUserData(globalQueryClient).resetClientUserData();
  }
  showToast({ message, position: "bottom" });

  void (async () => {
    const query = await getQuery?.();
    await redirectTo(name, query);
  })().finally(() => {
    isRedirecting = false;
  });
};

axiosInstance.interceptors.response.use(
  (response) => {
    const body: CommonRespWrap<unknown> = response.data;

    if (body.code !== RESP_CODE.OK) {
      switch (body.code) {
        case RESP_CODE.NOT_LOGGED_IN:
        case RESP_CODE.LOGIN_EXPIRED:
        case RESP_CODE.DATA_PARSE_ERROR:
          handleRedirect(
            "login",
            body.code === RESP_CODE.NOT_LOGGED_IN ? "未登录" : "登录过期，请重新登录",
            async () => {
              const { routerInstance } = await import("@/configs/router");
              return { fromPath: encodeURIComponent(routerInstance.currentRoute.value.fullPath) };
            },
            true
          );
          throw new RequestError("登录过期，请重新登录", body.code);

        case RESP_CODE.NOT_CAPTAIN:
        case RESP_CODE.CANNOT_LEAVE_TEAM:
        case RESP_CODE.CANNOT_CHANGE_CAPTAIN:
        case RESP_CODE.TEACHER_CANNOT_JOIN_STUDENT_TEAM:
          handleRedirect("team-info", body.message);
          throw new RequestError(body.message, body.code);

        default:
          throw new RequestError(body.message, body.code);
      }
    }
    return response;
  },
  (axiosErr) => {
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
      ...(jwt.value && { Authorization: `Bearer ${jwt.value}` }),
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
