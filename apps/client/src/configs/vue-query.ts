import { QueryCache, QueryClient, type QueryClientConfig } from "@tanstack/vue-query";
import { RequestError, RESP_CODE } from "shared";

const ONE_SECOND = 1 * 1000;

const MAX_QUERY_RETRY_COUNT = 2;

const isAuthExpiredError = (error: Error) =>
  error instanceof RequestError &&
  (error.code === RESP_CODE.NOT_LOGGED_IN || error.code === RESP_CODE.LOGIN_EXPIRED);

const globalQueryClientConfig: QueryClientConfig = {
  queryCache: new QueryCache({
    onError: (err) => console.error(err)
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAuthExpiredError(error)) return false;
        return failureCount < MAX_QUERY_RETRY_COUNT;
      },
      // 缓存生效时间
      staleTime: 0 * ONE_SECOND
    }
  }
};

export const globalQueryClient = new QueryClient(globalQueryClientConfig);
