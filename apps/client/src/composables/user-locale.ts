import messages from "@intlify/unplugin-vue-i18n/messages"; // 全量词条
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { createI18n, type I18n, useI18n } from "vue-i18n";

import { LANG_MAP, VALID_LANG, type ValidLanguage } from "@/constants";
import { useLocaleStore } from "@/store/locale";

const getInitLocale = (): string => {
  const { locale } = storeToRefs(useLocaleStore());
  if (locale.value) return locale.value;
  for (const lang of [
    ...((navigator.languages as Navigator["languages"] | undefined) || []),
    navigator.language
  ])
    if (VALID_LANG.some((prefix) => lang.startsWith(prefix))) return lang;
    else if (lang.toLowerCase() in LANG_MAP) return LANG_MAP[lang.toLowerCase()] as string;
  return "en";
};

export const useUserLocale = () => {
  const getInstance = (): I18n => {
    const locale = getInitLocale();
    const instance: I18n = createI18n({
      locale,
      fallbackLocale: "zh-Hans",
      availableLocales: VALID_LANG,
      globalInjection: true,
      messages
    });
    return instance;
  };
  const locale = computed({
    get: () => VALID_LANG.find((prefix) => useI18n().locale.value.startsWith(prefix)),
    set: (newLocale: ValidLanguage) => {
      useI18n().locale.value = newLocale;
      useLocaleStore().locale = newLocale;
    }
  });

  return { locale, getInstance };
};
