import { refAutoReset } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { computed, readonly } from "vue";

/** 路由导航超时时间 */
export const ROUTER_PENDING_TIMEOUT = 15000 as const;

/** 全局路由导航状态Store */
const useRouterStateStore = defineStore("routerState", () => {
  /** 进行中的导航数量，超时未归零将强制归零
   * 在Vue Router 5.x中，新导航会取消旧导航，因此这个量通常不会大于1 */
  const pendingNavigationCount = refAutoReset(0, ROUTER_PENDING_TIMEOUT);

  return {
    pendingNavigationCount
  };
});

/** 全局路由导航状态 */
export const useRouterState = () => {
  const { pendingNavigationCount } = storeToRefs(useRouterStateStore());

  /** 进行中的导航数量 计数器增加 */
  const incPendingNavigationCount = () => {
    pendingNavigationCount.value += 1;
  };

  /** 进行中的导航数量 计数器减少 */
  const decPendingNavigationCount = () => {
    pendingNavigationCount.value = Math.max(0, pendingNavigationCount.value - 1);
  };

  /** 进行中的导航数量 计数器重置 */
  const resetPendingNavigationCount = () => {
    pendingNavigationCount.value = 0;
  };

  /** 导航是否正在进行 */
  const isNavigationPending = computed(() => pendingNavigationCount.value > 0);

  return {
    pendingNavigationCount: readonly(pendingNavigationCount),
    incPendingNavigationCount,
    decPendingNavigationCount,
    resetPendingNavigationCount,
    isNavigationPending
  };
};
