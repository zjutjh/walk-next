import { type RemovableRef, useStorage, watchImmediate } from "@vueuse/core";
import { cloneDeep, get, isNil, isObject, mapValues, set, unset } from "lodash-es";
import { defineStore } from "pinia";
import { type Ref, ref, shallowRef } from "vue";
import { type LocationQueryRaw, useRoute, useRouter } from "vue-router";

/** Stored URL Query 状态Store */
const useUrlQueryStore = defineStore("urlQuery", () => {
  /** storeKey-响应式对象 关联表 */
  const refObj = shallowRef<Record<string, Ref>>({});
  return { refObj };
});

/** 将URL Query对象的所有成员编码为字符串形式 */
const stringifyUrlQueryObj = <UrlQueryToStringify extends Record<string, unknown>>(
  urlQueryObj: UrlQueryToStringify
) => {
  return mapValues(urlQueryObj, (value) => {
    // 分类型转换
    if (isNil(value)) return "";
    if (isObject(value)) return encodeURIComponent(JSON.stringify(value));
    return String(value);
  }) as LocationQueryRaw;
};

/** （初始化时）将URL Query对象中的字符串成员解析为默认值类型 */
const parseUrlQueryObj = <UrlQueryToParse extends Record<string, unknown>>(
  urlQueryObj: UrlQueryToParse,
  /** 传入类型与URL Query默认值类型完全相符的对象作为Schema */
  schemaExample: Readonly<UrlQueryToParse>
) => {
  return mapValues(urlQueryObj, (value, key) => {
    if (!(typeof value === "string")) {
      return value;
    }
    // 分类型转换
    if (schemaExample[key] === null) return null;
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
  }) as UrlQueryToParse;
};

/** Stored URL Query Composable 选项 */
type UseStoredUrlQueryOptions<UrlQuery> = {
  /** 默认值 */
  defaultValue: Readonly<UrlQuery>;
  /** URL Query持久化策略
   * @description undefined 不持久化
   * @description "memory" 内存中持久化，不抗reload
   * @description Storage 将通过该Storage进行持久化
   * @default undefined
   */
  persist?: "memory" | Storage;
  /** Store中使用的Map Key，影响数据存储位置
   * @default (VueRouter中的)route.path
   */
  storeKey?: string;
};

/** 加载Stored URL Query */
export const useStoredUrlQuery = <
  UrlQuery extends Record<string, unknown> = Record<string, string | string[]>
>(
  options: UseStoredUrlQueryOptions<UrlQuery>
) => {
  const urlQueryStore = useUrlQueryStore();
  const route = useRoute();
  const router = useRouter();

  // 解包传入的参数
  const { defaultValue, persist, storeKey = route.path } = options;

  /**
   * 获取响应式对象
   */

  /** storeKey对应的URL Query响应式对象 */
  let urlQuery = get(urlQueryStore.refObj, storeKey) as Ref<UrlQuery | undefined> | undefined;

  // storeKey对应的响应式对象不存在？
  if (isNil(urlQuery)) {
    // 构造响应式对象
    urlQuery = ref<UrlQuery>();
    // 存入响应式对象
    set(urlQueryStore.refObj, storeKey, urlQuery);
  }

  /**
   * 初始化URL Query
   */

  /** storeKey对应的Storage */
  const storageState: RemovableRef<UrlQuery> | undefined =
    persist instanceof Storage
      ? useStorage(`stored-url-query:${storeKey}`, defaultValue, persist, {
          // 不写入默认值，初始化时会执行合并写入
          writeDefaults: false
        })
      : undefined;

  // 获取storeKey对应的URL Query
  const currentUrlQuery = cloneDeep(route.query);
  // 滤除不在默认值类型中的成员
  for (const key of Object.keys(currentUrlQuery)) {
    if (!Object.hasOwn(defaultValue, key)) {
      unset(currentUrlQuery, key);
    }
  }
  // 计算初始值
  const initialValue = cloneDeep(defaultValue);
  if (persist === "memory") {
    // 合并内存Store中的URL Query
    Object.assign(initialValue, urlQuery.value);
  } else if (!isNil(storageState)) {
    // 合并Storage中的URL Query
    Object.assign(initialValue, storageState.value);
  }
  // 合并当前的URL Query
  Object.assign(initialValue, currentUrlQuery);

  // 设置URL Query初值
  urlQuery.value = parseUrlQueryObj<UrlQuery>(initialValue, defaultValue);

  /**
   * 启动侦听器，使地址栏与URL Query对象同步
   */

  // 侦听URL Query响应式对象变化
  watchImmediate(
    urlQuery,
    (newObj) => {
      if (isNil(newObj)) return;
      // 更新地址栏URL Query
      router.replace({
        query: {
          ...route.query,
          ...stringifyUrlQueryObj<UrlQuery>(newObj)
        }
      });
      // 更新Storage
      if (!isNil(storageState)) {
        storageState.value = newObj;
      }
    },
    {
      deep: true
    }
  );

  return { urlQuery } as { urlQuery: Ref<UrlQuery> };
};
