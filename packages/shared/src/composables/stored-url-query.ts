import { useLocalStorage } from "@vueuse/core";
import { cloneDeep, get, isNil, isObject, isUndefined, mapValues, set } from "lodash-es";
import { defineStore } from "pinia";
import { type Ref, ref, shallowRef, watch } from "vue";
import { type LocationQueryRaw, useRoute, useRouter } from "vue-router";

/** Stored URL Query 状态Store */
const useUrlQueryStore = defineStore("urlQuery", () => {
  /** path-响应式对象 关联表 */
  const refObj = shallowRef<Record<string, Ref>>({});
  return { refObj };
});

/** 将URL Query对象的所有成员编码为字符串形式 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringifyUrlQueryObj = <UrlQuery extends Record<string, any>>(
  urlQueryObj: UrlQuery,
  /** 传入类型与URL Query默认值类型完全相符的对象作为Schema */
  schemaExample: Readonly<UrlQuery>
) => {
  return mapValues(urlQueryObj, (value, key) => {
    // 默认值类型中无该成员，不做转换
    if (!Object.hasOwn(schemaExample, key)) return value;
    // 分类型转换
    if (isNil(value)) return "";
    if (isObject(value)) return encodeURIComponent(JSON.stringify(value));
    return String(value);
  }) as LocationQueryRaw;
};

/** （初始化时）将URL Query对象中的字符串成员解析为默认值类型 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseUrlQueryObj = <UrlQuery extends Record<string, any>>(
  urlQueryObj: UrlQuery,
  /** 传入类型与URL Query默认值类型完全相符的对象作为Schema */
  schemaExample: Readonly<UrlQuery>
) => {
  return mapValues(urlQueryObj, (value, key) => {
    // 默认值类型中无该成员，不做转换
    if (!Object.hasOwn(schemaExample, key)) return value;
    // 分类型转换
    if (value === null) return null;
    if (isObject(schemaExample[key])) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (err) {
        console.error(err);
        throw new TypeError(`Failed to parse URL Query member: ${String(key)}.`, { cause: err });
      }
    }
    switch (typeof schemaExample[key]) {
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
        throw new TypeError(`Unsupported URL Query member type: ${typeof schemaExample[key]}.`);
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
  defaultValue: Readonly<UrlQuery>;
};

/** 加载Stored URL Query */
export const useStoredUrlQuery = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  UrlQuery extends Record<string, any> = Record<string, string | string[]>
>(
  options: Options<UrlQuery>
) => {
  // 解包传入的参数，设置默认值
  const { defaultValue, persist } = options;

  /**
   * 获取响应式对象
   */

  const urlQueryStore = useUrlQueryStore();
  const route = useRoute();
  const router = useRouter();
  // 获取当前页面的path
  const currentPath = route.path;

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

  /** path对应的localStorage */
  const localStorageState = useLocalStorage(
    `stored-url-query-${currentPath}`,
    {},
    { writeDefaults: false }
  );
  // 获取当前页面的URL Query
  const currentUrlQuery = route.query;
  // 计算初始值
  const initialValue = cloneDeep(defaultValue);
  if (persist === "memory") {
    // 合并内存中Store的URL Query
    Object.assign(initialValue, urlQuery.value);
  } else if (persist === "persistent") {
    // 合并localStorage中的URL Query
    Object.assign(initialValue, localStorageState.value);
  }
  // 合并当前的URL Query
  Object.assign(initialValue, currentUrlQuery);

  // 设置URL Query初值
  urlQuery.value = parseUrlQueryObj<UrlQuery>(initialValue, defaultValue);

  /**
   * 启动侦听器，使地址栏与URL Query对象同步
   */

  // 侦听URL Query响应式对象变化
  watch(
    urlQuery,
    (newObj) => {
      if (isUndefined(newObj)) return;
      // 更新地址栏URL Query
      router.replace({
        query: stringifyUrlQueryObj<UrlQuery>(newObj, defaultValue)
      });
      // 更新localStorage
      if (persist === "persistent") {
        localStorageState.value = newObj;
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
