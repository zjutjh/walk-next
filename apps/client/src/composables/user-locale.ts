// import messages from "@intlify/unplugin-vue-i18n/messages"; // 全量词条
import { storeToRefs } from "pinia";
import { computed, nextTick } from "vue";
import { type Composer, createI18n, type I18n, type I18nOptions, useI18n } from "vue-i18n";

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

export const loadLocaleMessages = async (i18n: Composer, locale: ValidLanguage) => {
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `../locales/${locale}.yaml`
  );
  i18n.setLocaleMessage(locale, messages.default);
  return nextTick();
};

export const useUserLocale = () => {
  const initI18n = async (): Promise<I18n> => {
    const locale = getInitLocale();
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */ `../locales/${VALID_LANG.find((prefix) => locale.startsWith(prefix))}.yaml`
    );
    const i18n: I18n = createI18n({
      locale,
      fallbackLocale: "zh-Hans",
      availableLocales: [...VALID_LANG],
      globalInjection: true,
      // messages
      messages: { [locale]: messages.default }
    } satisfies I18nOptions);
    document.querySelector("html")?.setAttribute("lang", locale);
    return i18n;
  };
  const locale = computed({
    get: () => VALID_LANG.find((prefix) => useI18n().locale.value.startsWith(prefix)),
    set: async (newLocale: ValidLanguage) => {
      if (!useI18n().availableLocales.includes(newLocale))
        await loadLocaleMessages(useI18n(), newLocale);
      useI18n().locale.value = newLocale;
      useLocaleStore().locale = newLocale;
      document.querySelector("html")?.setAttribute("lang", newLocale);
    }
  });

  return { locale, initI18n };
};
