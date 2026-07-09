import type { SetRequired } from "type-fest";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";
import { useAuthStore } from "@/stores/auth";

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
      pageName: "重组团队"
    }
  },
  {
    path: "/dashboard/:campusId",
    props: true,
    name: "dashboard",
    component: () => import("@/pages/walk-dashboard/index.vue"),
    meta: {
      pageName: "数据大盘"
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
    name: "team",
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
      pageName: "数据统计表格"
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
routerConfig.beforeEach((to) => {
  const authStore = useAuthStore();
  // 拦截无效路由
  if (to.matched.length === 0) {
    return authStore.isLoggedIn ? { path: "/" } : { name: "login" };
  }
  // 已登录状态自动进入
  else if (authStore.isLoggedIn && to.name === "login") {
    return { path: "/" };
  }
  // 未登录状态返回登录
  else if (!authStore.isLoggedIn && !to.meta.allowNoAuth) {
    return { name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } };
  }
});
