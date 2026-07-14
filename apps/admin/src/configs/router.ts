import { useRouterState } from "shared";
import type { SetRequired } from "type-fest";
import { showFailToast, showToast } from "vant";
import {
  createRouter,
  createWebHistory,
  isNavigationFailure,
  NavigationFailureType,
  type RouteRecordRaw
} from "vue-router";

import { useAdminInfo } from "@/composables";
import IndexPage from "@/pages/index/index.vue";

import { globalQueryClient } from "./vue-query";

const routes: SetRequired<RouteRecordRaw, "meta">[] = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
    meta: {
      pageName: "首页"
    }
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      pageName: "管理员登录",
      allowNoAuth: true
    }
  },
  {
    path: "/team-rebuild",
    name: "team-rebuild",
    component: () => import("@/pages/team-rebuild/index.vue"),
    meta: {
      pageName: "重组团队",
      requiredPermission: "super"
    }
  },
  {
    path: "/dashboard/:campusIdParam",
    props: true,
    name: "dashboard",
    component: () => import("@/pages/walk-dashboard/index.vue"),
    meta: {
      pageName: "数据大盘",
      requiredPermission: "internal"
    }
  },
  {
    path: "/team-list/:campusIdParam",
    props: true,
    name: "team-list",
    component: () => import("@/pages/team-list/index.vue"),
    meta: {
      pageName: "团队列表"
    }
  },
  {
    path: "/team/:teamIdParam",
    name: "team-info",
    component: () => import("@/pages/team-info/index.vue"),
    props: true,
    meta: {
      pageName: "团队信息",
      recreateComponentByPath: true
    }
  },
  {
    path: "/data-table",
    name: "data-table",
    component: () => import("@/pages/data-table/index.vue"),
    meta: {
      pageName: "数据统计表格",
      requiredPermission: "internal"
    }
  }
];

export const routerInstance = createRouter({
  history: createWebHistory("/admin"),
  routes
});

// 前置路由守卫
routerInstance.beforeEach((to, from) => {
  const { hasPermission, isLoggedIn } = useAdminInfo(globalQueryClient);
  const { pendingNavigationCount } = useRouterState();

  // 拦截无效路由
  if (to.matched.length === 0) {
    return isLoggedIn.value ? { name: "index" } : { name: "login" };
  }
  // 已登录状态自动进入
  if (isLoggedIn.value && to.name === "login") {
    return { name: "index" };
  }
  // 未登录状态返回登录
  if (!isLoggedIn.value && !to.meta.allowNoAuth) {
    showToast("未登录");
    return { name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } };
  }
  // 权限不足
  if (!hasPermission(to.meta.requiredPermission)) {
    showFailToast("权限不足");
    // 上一页权限满足，返回上一页
    if (hasPermission(from.meta.requiredPermission)) {
      return from;
    }
    // 上一页权限不足，返回首页
    if (to.name !== "index") {
      return { name: "index" };
    }
  }

  // 更新路由状态
  pendingNavigationCount.value += 1;
});

// 后置路由守卫
routerInstance.afterEach((_to, _from, failure) => {
  const { pendingNavigationCount } = useRouterState();

  /**
   * Vue Router 5.x中，duplicated会跳过navigate，也就不会执行beforeEach，需要过滤，以免计数器泄露
   *  @see https://github.com/vuejs/router/blob/main/packages/router/src/router.ts */
  if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // 更新路由状态
    pendingNavigationCount.value -= 1;
  }
});

// 路由内部逻辑错误处理
routerInstance.onError((error) => {
  console.error(error);
  // 重置路由状态
  const { pendingNavigationCount } = useRouterState();
  pendingNavigationCount.value = 0;
});
