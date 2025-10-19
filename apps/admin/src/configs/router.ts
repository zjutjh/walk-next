import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import DataPanel from "@/pages/data-panel/index.vue";
import ScanPanel from "@/pages/scan-panel/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/scan-panel"
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
