import type { RouteRecordRaw } from "vue-router";

import navbar from "@/components/navbar/index.vue";
import profilePage from "@/pages/profile/index.vue";
import teamInfoPage from "@/pages/team-info/index.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/pages/login/index.vue"),
    meta: {
      pageName: "登录",
      layout: { props: { showNavbar: false, showLogo: true, bgDecorationVariant: "topAndBottom" } },
      allowNoAuth: true,
      guestOnly: true
    }
  },
  {
    path: "/register",
    meta: {
      allowNoAuth: true,
      guestOnly: true,
      layout: { props: { showNavbar: false, showLogo: true, bgDecorationVariant: "topAndBottom" } }
    },
    children: [
      {
        path: "",
        name: "register",
        component: () => import("@/pages/register-index/index.vue"),
        meta: {
          pageName: "注册",
          layout: { props: { showNavbar: false, showLogo: true, bgDecorationVariant: "default" } }
        }
      },
      {
        path: "student",
        name: "register-student",
        component: () => import("@/pages/register-school/index.vue"),
        props: { userType: "student" },
        meta: { pageName: "学生注册" }
      },
      {
        path: "teacher",
        name: "register-teacher",
        component: () => import("@/pages/register-school/index.vue"),
        props: { userType: "teacher" },
        meta: { pageName: "教职工注册" }
      },
      {
        path: "alumni",
        name: "register-alumni",
        component: () => import("@/pages/register-alumni/index.vue"),
        meta: { pageName: "校友注册" }
      }
    ]
  },
  {
    path: "/user-agreement",
    name: "userAgreement",
    component: () => import("@/pages/user-agreement/index.vue"),
    meta: { pageName: "用户协议与隐私政策", allowNoAuth: true, layout: { name: "plain-layout" } }
  },
  {
    path: "/registration-terms",
    name: "registrationTerms",
    component: () => import("@/pages/registration-terms/index.vue"),
    meta: { pageName: "报名须知与免责协议", allowNoAuth: true, layout: { name: "plain-layout" } }
  },
  {
    path: "/team",
    children: [
      {
        path: "",
        name: "team-info",
        components: { default: teamInfoPage, navbar },
        meta: { pageName: "team.info", layout: { props: { showNavbar: false, showLogo: true } } }
      },
      {
        path: "join/password",
        name: "team-password-join",
        component: () => import("@/pages/team-password-join/index.vue"),
        meta: { pageName: "密码加入", allowedRoles: ["unbind"] }
      },
      {
        path: "join/random",
        name: "team-random-join",
        component: () => import("@/pages/team-random-join/index.vue"),
        meta: { pageName: "随机加入", allowedRoles: ["unbind"] }
      },
      {
        path: "create",
        name: "team-create",
        component: () => import("@/pages/team-create/index.vue"),
        meta: { pageName: "创建团队", allowedRoles: ["unbind"] }
      },
      {
        path: "detail",
        name: "team-detail",
        component: () => import("@/pages/team-detail/index.vue"),
        meta: { pageName: "团队详情", allowedRoles: ["member", "captain"] }
      }
    ]
  },
  {
    path: "/profile",
    children: [
      {
        path: "",
        name: "profile",
        components: { default: profilePage, navbar },
        meta: { pageName: "profile", layout: { props: { showNavbar: false, showLogo: true } } }
      },
      {
        path: "edit",
        name: "profile-edit",
        component: () => import("@/pages/profile-edit/index.vue"),
        meta: { pageName: "修改信息" }
      }
    ]
  },
  {
    path: "/settings",
    name: "settings",
    components: { default: () => import("@/pages/settings/index.vue"), navbar },
    meta: { pageName: "settings", layout: { props: { showNavbar: false, showLogo: true } } }
  },
  {
    path: "/feedback",
    name: "feedback",
    component: () => import("@/pages/feedback/index.vue"),
    meta: { pageName: "反馈", layout: { name: "plain-layout", props: { noPadding: true } } }
  }
];
export default routes;
