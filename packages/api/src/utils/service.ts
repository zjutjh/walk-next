/* eslint-disable @typescript-eslint/no-explicit-any */
interface RequestFnParams {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** 用对象表示的 body */
  data?: Partial<Record<string, any>>;
  /** 用对象表示的 query 参数 */
  params?: Partial<Record<string, any>>;
}

export interface ServiceOptions<T> {
  baseURL?: string;
  request<R>(
    params: RequestFnParams,
    /** 各端请求函数需要的自定义函数 */
    options?: T
  ): Promise<R>;
}

export abstract class BaseService<T> {
  #baseURL: string = "";
  request: ServiceOptions<T>["request"] = () => {
    throw new Error("Service.request is undefined");
  };

  constructor(options: ServiceOptions<T>) {
    this.request = options.request;
    this.#baseURL = options.baseURL ?? "";
  }

  genBaseURL(path: `/${string}`) {
    return this.#baseURL + path;
  }
}

export const SERVICE_TIMEOUT = 15000 as const;
