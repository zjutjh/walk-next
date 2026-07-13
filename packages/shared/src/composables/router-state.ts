import { useTimeoutFn } from "@vueuse/core";
import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";

/** 路由导航超时时间 */
export const ROUTER_PENDING_TIMEOUT = 15000 as const;

/** 全局路由导航状态Store */
const useRouterStateStore = defineStore("routerState", () => {
  /** 进行中的导航数量 在Vue Router 5.x中，新导航会取消旧导航，因此这个量通常不会大于1 */
  const pendingNavigationCount = ref(0);

  // 超时重置计数器
  const { start: restartResetTimer, stop: stopResetTimer } = useTimeoutFn(() => {
    pendingNavigationCount.value = 0;
  }, ROUTER_PENDING_TIMEOUT);

  return {
    pendingNavigationCount,
    restartResetTimer,
    stopResetTimer
  };
});

/** 全局路由导航状态 */
export const useRouterState = () => {
  const routerStateStore = useRouterStateStore();
  const { pendingNavigationCount: pendingNavigationCountUnsafe } = storeToRefs(routerStateStore);
  const { restartResetTimer, stopResetTimer } = routerStateStore;

  /** 进行中的导航数量 */
  const pendingNavigationCount = computed({
    get: () => pendingNavigationCountUnsafe.value,
    set: (value) => {
      if (value > 0) {
        pendingNavigationCountUnsafe.value = value;
        // 计数器超时未归零则重置计数器
        restartResetTimer();
      } else {
        pendingNavigationCountUnsafe.value = 0;
        stopResetTimer();
      }
    }
  });

  /** 导航是否正在进行 */
  const isNavigationPending = computed(() => pendingNavigationCount.value > 0);

  return {
    pendingNavigationCount,
    isNavigationPending
  };
};
