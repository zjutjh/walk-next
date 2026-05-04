import type { SetRequired } from "type-fest";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";

const routes: SetRequired<RouteRecordRaw, "meta">[] = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
    meta: {
      pageName: "功能总览"
    }
  },
  {
    path: "/team-rebuild",
    name: "team-rebuild",
    component: () => import("@/pages/team-rebuild/index.vue"),
    meta: {
      pageName: "重组队伍"
    }
  },
  {
    path: "/team-manage/:id",
    name: "team-manage",
    component: () => import("@/pages/team-manage/index.vue"),
    props: true,
    meta: {
      pageName: "团队信息管理"
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
