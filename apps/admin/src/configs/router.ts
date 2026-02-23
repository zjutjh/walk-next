import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";
import TeamList from "@/pages/team-list/index.vue";
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
  },
  {
    path: "/team-list",
    name: "team-list",
    component: TeamList,
    meta: {
      title: "团队信息页"
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
