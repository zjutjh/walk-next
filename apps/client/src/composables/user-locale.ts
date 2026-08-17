import { computed, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";

import { LANG_MAP, VALID_LANG, type ValidLanguage } from "@/constants";
import { useLocaleStore } from "@/store/locale";

export const useUserLocale = () => {
  const locale = computed({
    get: () => {
      if (getCurrentInstance())
        return VALID_LANG.find((prefix) => useI18n().locale.value.startsWith(prefix));
      if (useLocaleStore().locale) return useLocaleStore().locale;
      for (const lang of [
        ...((navigator.languages as Navigator["languages"] | undefined) || []),
        navigator.language
      ])
        if (VALID_LANG.some((prefix) => lang.startsWith(prefix))) return lang;
        else if (lang.toLowerCase() in LANG_MAP) return LANG_MAP[lang.toLowerCase()];
      return "en";
    },
    set: (newLocale: ValidLanguage) => {
      useI18n().locale.value = newLocale;
      useLocaleStore().locale = newLocale;
    }
  });

  return { locale };
};
