import "vue-router";

// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    /**
     * 中文页面名称
     */
    pageName: string;
    /**
     * 路由参数变化时强制重建组件
     */
    recreateComponentByPath?: boolean;
  }
}
