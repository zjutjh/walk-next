import type { InfiniteData } from "@tanstack/vue-query";
import { isNil } from "lodash-es";

/** 修改 Tanstack Query InfiniteData 的数据 */
export const patchInfiniteQueryPages = <T>(
  oldData: InfiniteData<T> | undefined,
  /** 对每一页执行的函数，返回更新后的数据的引用 */
  patcher: (page: T) => T
): InfiniteData<T> | undefined => {
  if (isNil(oldData)) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map(patcher)
  };
};
