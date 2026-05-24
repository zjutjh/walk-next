import type { SetRequired } from "type-fest";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import IndexPage from "@/pages/index/index.vue";

const routes: SetRequired<RouteRecordRaw, "meta">[] = [
  {
    path: "/",
    name: "index",
    component: IndexPage,
    meta: {
      pageName: "精弘毅行管理后台"
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
    path: "/team/:id",
    name: "team",
    component: () => import("@/pages/team-info/index.vue"),
    props: true,
    meta: {
      pageName: "团队信息"
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
