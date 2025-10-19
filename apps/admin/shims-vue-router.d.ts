import "vue-router";

// To ensure it is treated as a module, add at least one `export` statement
export {};

declare module "vue-router" {
  interface RouteMeta {
    /** 中文页面名称 */
    title: string;
    /**
     * 页面图标名称，icon 来自 Vant 组件库
     * @see https://vant-ui.github.io/vant/#/zh-CN/icon#props
     */
    icon?: string;
    isTabPage?: boolean;
  }
}
