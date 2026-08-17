import WalkClientService from "api/services/client";
import { type CommonRespWrap, type ServiceOptions } from "api/utils";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { RequestError, RESP_CODE } from "shared";
import { showToast } from "vant";

import { useClientUserData } from "@/composables";
import { globalQueryClient, routerInstance } from "@/configs";

const SERVICE_TIMEOUT = 15000 as const;

const axiosInstance = axios.create({ timeout: SERVICE_TIMEOUT });

axiosInstance.interceptors.response.use(
  (response) => {
    const body: CommonRespWrap<unknown> = response.data;

    if (body.code !== RESP_CODE.OK) {
      switch (body.code) {
        // 未登录或登录过期
        case RESP_CODE.NOT_LOGGED_IN:
        case RESP_CODE.LOGIN_EXPIRED:
          showToast({
            message: body.code === RESP_CODE.NOT_LOGGED_IN ? "未登录" : "登录过期",
            position: "bottom"
          });
          useClientUserData(globalQueryClient).resetClientUserData();
          routerInstance.push({
            name: "login",
            query: { fromPath: encodeURIComponent(routerInstance.currentRoute.value.fullPath) }
          });
          break;
        default:
      }
      throw new RequestError(body.message, body.code);
    }
    return response;
  },
  (axiosErr: AxiosError) => {
    throw RequestError.fromAxiosError(axiosErr);
  }
);

export const request: ServiceOptions<AxiosRequestConfig>["request"] = async (req, options) => {
  const { data: body } = await axiosInstance({
    url: req.url,
    method: req.method,
    params: req.params,
    data: req.data,
    // headers: {}
    ...options
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (body as CommonRespWrap<any>).data;
};

export const walkClientService = new WalkClientService({ request, baseURL: "/api" });
