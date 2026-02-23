import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";
import TeamList from "@/pages/team-list/index.vue";
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
  },
  {
    path: "/team-list",
    name: "team-list",
    component: TeamList,
    meta: {
      title: "团队信息页" // 这里就是 default-layout 会抓取的标题！
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
