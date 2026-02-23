import { useTitle } from "@vueuse/core";
import { compact } from "lodash-es";
import { computed } from "vue";
import { useRoute } from "vue-router";

interface UseTitleMetaOptions {
  /**
   * 自定义页面标题
   *
   * @default pageName
   */
  title?: string;
}

export function useTitleMeta(options?: UseTitleMetaOptions) {
  const route = useRoute();

  const pageNameTitle = computed(() => {
    const slice = route.matched.map((item) => item.meta.pageName);

    const proceed = compact(slice).concat(["毅行管理后台"]);

    return proceed.join(" | ");
  });

  useTitle(options?.title || pageNameTitle);
}
