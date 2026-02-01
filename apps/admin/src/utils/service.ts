import { RESP_CODE } from "api/response-code/admin";
import { WalkAdminService } from "api/services";
import { type CommonRespWrap, type ServiceOptions } from "api/utils";
import { SERVICE_TIMEOUT } from "api/utils";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { RequestError, toCamelCase, toSnakeCase } from "shared";

const axiosInstance = axios.create({ timeout: SERVICE_TIMEOUT });

axiosInstance.interceptors.response.use(
  (response) => {
    const body: CommonRespWrap<unknown> = response.data;
    if (body.code !== RESP_CODE.OK) {
      switch (body.code) {
        // TODO:请求错误全局处理
        default:
      }
      throw new RequestError(body.msg, body.code);
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
    method: toSnakeCase(req.method),
    params: toSnakeCase(req.params),
    data: req.data,
    // headers: {}
    ...options
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toCamelCase((body as CommonRespWrap<any>).data);
};

export const walkAdminService = new WalkAdminService({ request, baseURL: "/api" });
