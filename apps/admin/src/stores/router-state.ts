import { defineStore } from "pinia";
import { computed, ref } from "vue";

/** 全局路由导航状态 */
export const useRouterStateStore = defineStore("routerState", () => {
  /** 进行中的导航数量 在Vue Router 5.x中，新导航会取消旧导航，因此这个量通常不会大于1 */
  const pendingNavigationCount = ref(0);
  /** 导航是否正在进行 */
  const isNavigationPending = computed(() => pendingNavigationCount.value > 0);

  return {
    pendingNavigationCount,
    isNavigationPending
  };
});
