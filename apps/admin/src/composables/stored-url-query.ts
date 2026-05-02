/* eslint-disable @typescript-eslint/no-explicit-any */
import { cloneDeep, get, isNil, isObject, isUndefined, mapValues, set } from "lodash-es";
import { defineStore } from "pinia";
import { type Ref, ref, shallowRef, watch } from "vue";
import type { LocationQueryRaw } from "vue-router";

import { routerConfig as router } from "@/configs";

const route = router.currentRoute;

/** Stored URL Query 状态Store */
const useUrlQueryStore = defineStore("urlQuery", () => {
  /** path-响应式对象 关联表 */
  const refObj = shallowRef<Record<string, Ref>>({});
  return { refObj };
});

/** 将URL Query对象的所有成员编码为字符串或字符串数组形式 */
const stringifyUrlQueryObj = <UrlQuery extends Record<string, any>>(urlQueryObj: UrlQuery) => {
  return mapValues(urlQueryObj, (value) => {
    if (isNil(value)) return "";
    if (isObject(value)) return encodeURIComponent(JSON.stringify(value));
    return String(value);
  }) as LocationQueryRaw;
};

/** （初始化时）将URL Query对象中的字符串成员解析为原类型 */
const parseUrlQueryObj = <UrlQuery extends Record<string, any>>(
  urlQueryObj: UrlQuery,
  /** 传入类型与URL Query原类型完全相符的对象作为样板 */
  originalTypeExample: Readonly<UrlQuery>
) => {
  return mapValues(urlQueryObj, (value, key: keyof UrlQuery) => {
    if (value === null) return null;
    if (isObject(originalTypeExample[key])) return JSON.parse(decodeURIComponent(value));
    switch (typeof originalTypeExample[key]) {
      case "string":
        return value;
      case "undefined":
        return undefined;
      case "number":
        return Number(value);
      case "boolean":
        return value === "false" ? false : Boolean(value);
      case "bigint":
        return BigInt(value);
      default:
        throw new TypeError(`不支持的URL Query成员类型:${typeof originalTypeExample[key]}`);
    }
  }) as UrlQuery;
};

/** @see {useStoredUrlQuery} 选项 */
type Options<UrlQuery> = {
  /** URL Query持久化策略
   * @enum undefined 不持久化
   * @enum "memory" 内存中持久化，不抗reload
   * @enum "persistent" 在localStorage中持久化
   * @default "none"
   */
  persist?: "memory" | "persistent";
  /** 初始值 */
  initialValue: Readonly<UrlQuery>;
};

/** 加载Stored URL Query */
export const useStoredUrlQuery = <
  UrlQuery extends Record<string, any> = Record<string, string | string[]>
>(
  options: Options<UrlQuery>
) => {
  // 解包传入的参数，设置默认值
  const { initialValue: originalInitialValue, persist } = options;

  /**
   * 获取响应式对象
   */

  const urlQueryStore = useUrlQueryStore();
  // 获取当前页面的path
  const currentPath = route.value.path;

  /** 当前页面对应的URL Query响应式对象 */
  let urlQuery = get(urlQueryStore.refObj, currentPath) as Ref<UrlQuery | undefined> | undefined;

  // 当前页面对应的响应式对象不存在？
  if (isUndefined(urlQuery)) {
    // 构造响应式对象
    urlQuery = ref<UrlQuery>();
    // 存入响应式对象
    set(urlQueryStore.refObj, currentPath, urlQuery);
  }

  /**
   * 初始化URL Query
   */

  /** path对应的localStorage的key */
  const localStorageKey = `stored-url-query-${currentPath}`;
  // 获取当前页面的URL Query
  const currentSearchParams = new URLSearchParams(window.location.search || "");
  const currentValue: Record<string, any> = {};
  for (const query of currentSearchParams.keys()) {
    // 参数唯一则原样获取，否则以参数数组的形式获取
    currentValue[query] =
      currentSearchParams.getAll(query).length > 1
        ? currentSearchParams.getAll(query)
        : currentSearchParams.get(query);
  }
  // 计算初始值
  const initialValue = cloneDeep(originalInitialValue);
  if (persist === "memory") {
    // 合并内存中Store的URL Query
    Object.assign(initialValue, urlQuery.value);
  } else if (persist === "persistent") {
    // 合并localStorage中的URL Query
    const localStorageValue = localStorage.getItem(localStorageKey);
    if (localStorageValue !== null) {
      Object.assign(initialValue, JSON.parse(localStorageValue));
    }
  }
  // 合并当前的URL Query
  Object.assign(initialValue, currentValue);

  // 设置URL Query初值
  urlQuery.value = parseUrlQueryObj<UrlQuery>(initialValue, originalInitialValue);

  /**
   * 启动侦听器，使地址栏与URL Query对象同步
   */

  // 侦听URL Query响应式对象变化
  watch(
    urlQuery,
    (newObj) => {
      if (isUndefined(newObj)) return;
      // 更新地址栏URL Query
      router.replace({ query: stringifyUrlQueryObj<UrlQuery>(newObj) });
      // 更新localStorage
      if (persist === "persistent") {
        localStorage.setItem(localStorageKey, JSON.stringify(newObj));
      }
    },
    {
      deep: true,
      // 立即同步一次
      immediate: true
    }
  );

  return { urlQuery } as { urlQuery: Ref<UrlQuery> };
};
