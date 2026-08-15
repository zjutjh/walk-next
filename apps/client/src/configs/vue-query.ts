import { QueryCache, QueryClient, type QueryClientConfig } from "@tanstack/vue-query";

const ONE_SECOND = 1 * 1000;

const globalQueryClientConfig: QueryClientConfig = {
  queryCache: new QueryCache({
    onError: (err) => console.error(err)
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      // 缓存生效时间
      staleTime: 0 * ONE_SECOND
    }
  }
};

export const globalQueryClient = new QueryClient(globalQueryClientConfig);
