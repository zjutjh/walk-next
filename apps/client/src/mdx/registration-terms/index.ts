import { defineAsyncComponent, defineComponent, h } from "vue";

import { useUserLocale } from "@/composables";

export default defineComponent({
  name: "RegistrationTermsMdx",
  setup() {
    return () =>
      h(
        defineAsyncComponent(() =>
          import(`./${useUserLocale().locale.value}.mdx`).catch(() => import("./zh-Hans.mdx"))
        )
      );
  }
});
