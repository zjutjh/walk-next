import "vue-router";

import type { PermissionLevel } from "api/types/admin";

// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    /** 中文页面名称 */
    pageName: string;
    /** 不需要登录即可访问 */
    allowNoAuth?: boolean;
    /** 访问该路由需要的权限等级 */
    requiredPermission?: PermissionLevel;
    /** 路由参数变化时强制重建组件 */
    recreateComponentByPath?: boolean;
  }
}
