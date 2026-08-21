import { useRouterState } from "shared";
import type { SetRequired } from "type-fest";
import { showFailToast, showToast } from "vant";
import {
  createRouter,
  createWebHistory,
  isNavigationFailure,
  NavigationFailureType,
  type RouteRecordRaw
} from "vue-router";

import { useClientUserData } from "@/composables";

import { globalQueryClient } from "./vue-query";

const routes: SetRequired<RouteRecordRaw, "meta">[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      pageName: "登录",
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/pages/register-index/index.vue"),
    meta: {
      pageName: "注册",
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/register/student",
    name: "register-student",
    component: () => import("@/pages/register-school/index.vue"),
    props: { userType: "student" },
    meta: {
      pageName: "学生注册",
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/register/teacher",
    name: "register-teacher",
    component: () => import("@/pages/register-school/index.vue"),
    props: { userType: "teacher" },
    meta: {
      pageName: "教职工注册",
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/register/alumnus",
    name: "register-alumnus",
    component: () => import("@/pages/register-alumnus/index.vue"),
    meta: {
      pageName: "校友注册",
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/terms",
    name: "terms",
    component: () => import("@/pages/terms/index.vue"),
    meta: {
      pageName: "用户协议与隐私政策",
      allowNoAuth: true
    }
  },
  {
    path: "/team",
    name: "team-info",
    component: () => import("@/pages/team-info/index.vue"),
    meta: {
      pageName: "团队信息"
    }
  },
  {
    path: "/team/join/password",
    name: "team-password-join",
    component: () => import("@/pages/team-password-join/index.vue"),
    meta: {
      pageName: "密码加入",
      allowedRoles: ["unbind"]
    }
  },
  {
    path: "/team/join/random",
    name: "team-random-join",
    component: () => import("@/pages/team-random-join/index.vue"),
    meta: {
      pageName: "随机加入",
      allowedRoles: ["unbind"]
    }
  },
  {
    path: "/team/create",
    name: "team-create",
    component: () => import("@/pages/team-create/index.vue"),
    meta: {
      pageName: "创建团队",
      allowedRoles: ["unbind"]
    }
  },
  {
    path: "/team/detail",
    name: "team-detail",
    component: () => import("@/pages/team-detail/index.vue"),
    meta: {
      pageName: "团队详情",
      allowedRoles: ["member", "captain"]
    }
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/pages/profile/index.vue"),
    meta: {
      pageName: "个人信息"
    }
  },
  {
    path: "/profile/edit",
    name: "profile-edit",
    component: () => import("@/pages/profile-edit/index.vue"),
    meta: {
      pageName: "修改信息"
    }
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/pages/settings/index.vue"),
    meta: {
      pageName: "设置"
    }
  }
];

export const routerInstance = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH),
  routes
});

// 前置路由守卫
routerInstance.beforeEach((to) => {
  const { clientUserInfo, isLoggedIn } = useClientUserData(globalQueryClient);
  const { incPendingNavigationCount } = useRouterState();

  // 拦截无效路由
  if (to.matched.length === 0) {
    return isLoggedIn.value ? { name: "team-info" } : { name: "login" };
  }

  if (!isLoggedIn.value && !to.meta.allowNoAuth) {
    showToast({ message: "未登录", position: "bottom" });
    return { name: "login", query: { fromPath: encodeURIComponent(to.fullPath) } };
  }

  // 已登录访问登录/注册/身份选择页
  if (isLoggedIn.value && to.meta.guestOnly) {
    return { name: "team-info" };
  }

  if (to.meta.allowedRoles) {
    const role = clientUserInfo.value?.role;

    if (!role || !to.meta.allowedRoles.includes(role)) {
      showFailToast("当前状态不可访问");
      return { name: "team-info" };
    }
  }

  incPendingNavigationCount();
});

// 后置路由守卫
routerInstance.afterEach((_to, _from, failure) => {
  const { decPendingNavigationCount } = useRouterState();

  /**
   * Vue Router 5.x中，duplicated会跳过navigate，也就不会执行beforeEach，需要过滤，以免计数器泄露
   *  @see https://github.com/vuejs/router/blob/main/packages/router/src/router.ts */
  if (!isNavigationFailure(failure, NavigationFailureType.duplicated)) {
    // 更新全局路由状态
    decPendingNavigationCount();
  }
});

// 路由内部逻辑错误处理
routerInstance.onError((error) => {
  console.error(error);
  // 重置全局路由状态
  const { resetPendingNavigationCount } = useRouterState();
  resetPendingNavigationCount();
});
