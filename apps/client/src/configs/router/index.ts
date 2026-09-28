import { useRouterState } from "shared";
import { showFailToast, showToast } from "vant";
import {
  createRouter,
  createWebHistory,
  isNavigationFailure,
  NavigationFailureType,
  type RouteLocationRaw
} from "vue-router";

import { useClientUserData } from "@/composables";
import { globalQueryClient } from "@/configs/vue-query";
import { scrollToHash } from "@/utils/scroll-to-hash";

import routes from "./routes";

// #region 路由实例与守卫
export const routerInstance = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes
});

// 前置路由守卫
routerInstance.beforeEach((to) => {
  const { clientUserInfo, isLoggedIn } = useClientUserData(globalQueryClient);
  const { incPendingNavigationCount, decPendingNavigationCount } = useRouterState();

  // 进入守卫即计数；守卫内重定向（NAVIGATION_GUARD_REDIRECT）不会触发 afterEach，需自行归还计数
  incPendingNavigationCount();

  const redirect = (location: RouteLocationRaw) => {
    decPendingNavigationCount();
    return location;
  };

  // 拦截无效路由
  if (to.matched.length === 0) {
    return redirect(isLoggedIn.value ? { name: "team-info" } : { name: "login" });
  }

  if (!isLoggedIn.value && !to.meta.allowNoAuth) {
    showToast({ message: "未登录", position: "bottom" });
    return redirect({ name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } });
  }

  // 已登录访问仅未登录用户可访问的页面
  if (isLoggedIn.value && to.meta.guestOnly) return redirect({ name: "team-info" });

  if (to.meta.allowedRoles) {
    const role = clientUserInfo.value?.role;

    if (!role || !to.meta.allowedRoles.includes(role)) {
      showFailToast("当前状态不可访问");
      return redirect({ name: "team-info" });
    }
  }
});

// 后置路由守卫
routerInstance.afterEach((to, _from, failure) => {
  const { decPendingNavigationCount } = useRouterState();

  /**
   * Vue Router 5.x中，duplicated会跳过navigate，也就不会执行beforeEach，需要过滤，以免计数器泄露
   *  @see https://github.com/vuejs/router/blob/main/packages/router/src/router.ts */
  if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // 更新全局路由状态
    decPendingNavigationCount();
  }

  // hash 定位：等待异步内容渲染后滚动到目标元素
  if (!failure && to.hash) scrollToHash(to.hash);
});

// 路由内部逻辑错误处理
routerInstance.onError((error) => {
  console.error(error);
  // 重置全局路由状态
  const { resetPendingNavigationCount } = useRouterState();
  resetPendingNavigationCount();
});
// #endregion
