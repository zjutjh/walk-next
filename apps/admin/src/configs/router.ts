import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    component: IndexPage
  },
  {
    path: "/team-rebuild",
    name: "team-rebuild",
    component: () => import("@/pages/team-rebuild/index.vue"),
    meta: {
      title: "重组队伍"
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
