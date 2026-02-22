import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";
import RebuildTeam from "@/pages/team-rebuild/index.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    component: IndexPage
  },
  {
    path: "/team-rebuild",
    name: "team-rebuild",
    component: RebuildTeam,
    meta: {
      title: "重组队伍"
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
