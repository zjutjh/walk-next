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

export const routerInstance = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes
});

routerInstance.beforeEach((to) => {
  const { clientUserInfo, isLoggedIn } = useClientUserData(globalQueryClient);
  const { incPendingNavigationCount, decPendingNavigationCount } = useRouterState();

  // 守卫内重定向（NAVIGATION_GUARD_REDIRECT）不触发 afterEach，计数只能由 redirect 自行归还
  incPendingNavigationCount();

  const redirect = (location: RouteLocationRaw) => {
    decPendingNavigationCount();
    return location;
  };

  if (to.matched.length === 0) {
    return redirect(isLoggedIn.value ? { name: "team-info" } : { name: "login" });
  }

  if (!isLoggedIn.value && !to.meta.allowNoAuth) {
    showToast({ message: "未登录" });
    return redirect({ name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } });
  }

  if (isLoggedIn.value && to.meta.guestOnly) return redirect({ name: "team-info" });

  if (to.meta.allowedRoles) {
    const role = clientUserInfo.value?.role;

    if (!role || !to.meta.allowedRoles.includes(role)) {
      showFailToast("当前状态不可访问");
      return redirect({ name: "team-info" });
    }
  }
});

routerInstance.afterEach((to, _from, failure) => {
  const { decPendingNavigationCount } = useRouterState();

  // duplicated 导航会跳过 beforeEach 就直接结束，计数只在非 duplicated 时归还，否则会泄漏
  // @see https://github.com/vuejs/router/blob/main/packages/router/src/router.ts
  if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    decPendingNavigationCount();
  }

  // hash 目标元素可能由异步数据渲染，需等渲染完成后再滚动
  if (!failure && to.hash) scrollToHash(to.hash);
  else if (!failure) document.querySelector("main")?.scrollTo({ top: 0 });
});

routerInstance.onError((error) => {
  console.error(error);
  const { resetPendingNavigationCount } = useRouterState();
  resetPendingNavigationCount();
});
