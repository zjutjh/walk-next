import WalkAdminService from "api/services/admin";
import { SERVICE_TIMEOUT } from "api/utils";
import { type CommonRespWrap, type ServiceOptions } from "api/utils";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { RequestError, RESP_CODE } from "shared";

import { useAdminInfo } from "@/composables/admin-user-info";
import { routerConfig as router } from "@/configs";

const axiosInstance = axios.create({ timeout: SERVICE_TIMEOUT });

axiosInstance.interceptors.response.use(
  (response) => {
    const body: CommonRespWrap<unknown> = response.data;

    if (body.code !== RESP_CODE.OK) {
      switch (body.code) {
        // 未登录
        case RESP_CODE.NOT_LOGGED_IN:
          useAdminInfo().resetAdminInfo();
          router.push({
            name: "login",
            query: { fromPath: encodeURIComponent(router.currentRoute.value.fullPath) }
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

export const walkAdminService = new WalkAdminService({ request, baseURL: "/api" });
