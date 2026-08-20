import "vue-router";

// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    /** 中文页面名称 */
    pageName: string;
    /** 不需要登录即可访问 */
    allowNoAuth?: boolean;
    /** 路由参数变化时强制重建组件 */
    recreateComponentByPath?: boolean;
    /** 允许访问该路由的团队身份 */
    allowedRoles?: UserRole[];
  }
}