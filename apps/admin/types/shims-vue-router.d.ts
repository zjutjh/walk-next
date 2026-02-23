import "vue-router";

// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    /**
     * 中文页面名称
     */
    pageName: string;
  }
}
