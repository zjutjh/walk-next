import type { AsyncComponentLoader } from "vue";

import DefaultLayout from "./default-layout/index.vue";
import type { DefaultLayoutProps } from "./default-layout/types";
import type { PlainLayoutProps } from "./plain-layout/types";

export { DefaultLayout };

export interface LayoutRegistry {
  "default-layout": {
    component: typeof DefaultLayout;
    props: DefaultLayoutProps;
  };
  "plain-layout": {
    component: AsyncComponentLoader;
    props: PlainLayoutProps;
  };
  "invite-layout": {
    component: AsyncComponentLoader;
    props: Record<string, never>;
  };
}

export type LayoutName = keyof LayoutRegistry;

/** 路由 meta.layout 的类型：name 决定布局，props 随布局而变 */
export type RouteLayout =
  | { name?: "default-layout"; props?: DefaultLayoutProps }
  | {
      [N in Exclude<LayoutName, "default-layout">]: {
        name: N;
        props?: LayoutRegistry[N]["props"];
      };
    }[Exclude<LayoutName, "default-layout">];

const modules = import.meta.glob<AsyncComponentLoader>("./*/index.vue");

const result: Record<string, AsyncComponentLoader> = {};
for (const [path, loader] of Object.entries(modules)) {
  const name = path.split("/")[1];
  if (name && name !== "default-layout") result[name] = loader;
}

export const layouts = result as Record<
  Exclude<LayoutName, "default-layout">,
  AsyncComponentLoader
>;
