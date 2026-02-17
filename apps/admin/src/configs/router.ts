import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import DataPanel from "@/pages/data-panel/index.vue";
import index from "@/pages/index/index.vue";
import ScanPanel from "@/pages/scan-panel/index.vue";
import RebuildTeam from "@/pages/team-rebuild/index.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "index",
    component: index
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
    path: "/scan-panel",
    name: "scan-panel",
    component: ScanPanel,
    meta: {
      title: "扫码工具",
      icon: "scan",
      isTabPage: true
    }
  },
  {
    path: "/data-panel",
    name: "data-panel",
    component: DataPanel,
    meta: {
      title: "数据大盘",
      icon: "list-switching",
      isTabPage: true
    }
  }
];

export const routerConfig = createRouter({
  history: createWebHistory(),
  routes
});
