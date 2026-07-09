import type { SetRequired } from "type-fest";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import { useAdminInfo } from "@/composables/admin-user-info";
import IndexPage from "@/pages/index/index.vue";

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
    path: "/dashboard/:campusId",
    props: true,
    name: "dashboard",
    component: () => import("@/pages/walk-dashboard/index.vue"),
    meta: {
      pageName: "数据大盘",
      requiredPermission: "internal"
    }
  },
  {
    path: "/team-list/:campusId",
    props: true,
    name: "team-list",
    component: () => import("@/pages/team-list/index.vue"),
    meta: {
      pageName: "团队列表"
    }
  },
  {
    path: "/team/:teamIdStr",
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

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
routerConfig.beforeEach((to, from) => {
  const { hasPermission, isLoggedIn } = useAdminInfo();
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
    return { name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } };
  }
  // 权限不足
  if (!hasPermission(to.meta.requiredPermission)) {
    // 上一页权限满足，返回上一页
    if (hasPermission(from.meta.requiredPermission)) {
      return from;
    }
    // 上一页权限不足，返回首页
    if (to.name !== "index") {
      return { name: "index" };
    }
  }
});
