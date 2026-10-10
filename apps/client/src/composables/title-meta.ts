import { useTitle } from "@vueuse/core";
import { compact } from "lodash-es";
import { computed, type MaybeRef, onScopeDispose, shallowRef, unref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const overrideTitle = shallowRef<MaybeRef<string | undefined>>();

export function useOverrideTitle(title: MaybeRef<string | undefined>) {
  overrideTitle.value = title;
  onScopeDispose(() => {
    if (overrideTitle.value === title) overrideTitle.value = undefined;
  });
}

export function useTitleMeta() {
  const route = useRoute();
  const { t } = useI18n();

  const pageNameTitle = computed(() => {
    const slice = route.matched.map((item) => item.meta.pageName);

    const proceed = [...compact(slice).toReversed(), "精弘毅行"];

    return proceed.map((pageName) => t(pageName)).join(" | ");
  });

  useTitle(computed(() => unref(overrideTitle.value) ?? pageNameTitle.value));
}
