import { useTitle } from "@vueuse/core";
import { computed } from "vue";
import { useRoute } from "vue-router";

export function useTitleMeta() {
  const route = useRoute();

  const title = computed(() => {
    // 从路由里面拿到所有的 meta.title
    const slice = route.matched.map((item) => item.meta.title);

    const proceed = slice.filter(Boolean).concat(["毅行管理后台"]);

    return proceed.join(" | ");
  });

  useTitle(title);
}
