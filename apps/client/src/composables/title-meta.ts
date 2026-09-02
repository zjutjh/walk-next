import { useTitle } from "@vueuse/core";
import { compact } from "lodash-es";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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
  const { t } = useI18n();

  const pageNameTitle = computed(() => {
    const slice = route.matched.map((item) => item.meta.pageName);

    const proceed = compact(slice).reverse().concat(["精弘毅行"]);

    return proceed.map((pageName) => t(pageName)).join(" | ");
  });

  useTitle(options?.title || pageNameTitle);
}
