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
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
