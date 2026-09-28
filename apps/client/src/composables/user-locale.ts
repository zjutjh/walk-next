// import messages from "@intlify/unplugin-vue-i18n/messages"; // 全量词条
import { storeToRefs } from "pinia";
import { Locale } from "vant";
import { computed, nextTick, type WritableComputedRef } from "vue";
import { type Composer, createI18n, type I18n, type I18nOptions, useI18n } from "vue-i18n";

import { LANG_MAP, LANG_META, VALID_LANG, type ValidLanguage } from "@/constants";
import { useLocaleStore } from "@/store/locale";

const getInitLocale = (): string => {
  const { locale } = storeToRefs(useLocaleStore());
  if (locale.value) return locale.value;
  for (const lang of [
    ...((navigator.languages as Navigator["languages"] | undefined) || []),
    navigator.language
  ])
    if (VALID_LANG.some((prefix) => lang.startsWith(prefix))) return lang;
    else {
      const mappedLang: ValidLanguage | undefined = LANG_MAP[lang.toLowerCase()];
      if (mappedLang) return mappedLang;
    }
  return "en";
};

export const loadLocaleMessages = async (i18n: Composer, locale: ValidLanguage): Promise<void> => {
  const messages = await import(`../locales/${locale}.yaml`);
  i18n.setLocaleMessage(locale, messages.default);
  return nextTick();
};

export const initI18n = async (): Promise<I18n> => {
  const locale = getInitLocale();
  const lang: ValidLanguage = VALID_LANG.find((prefix) => locale.startsWith(prefix)) ?? "en";
  const messages = await import(`../locales/${lang}.yaml`);
  const i18n: I18n = createI18n({
    locale,
    fallbackLocale: "zh-Hans",
    availableLocales: [...VALID_LANG],
    globalInjection: true,
    // messages
    messages: { [locale]: messages.default }
  } satisfies I18nOptions);
  Locale.use(LANG_META[lang].vant);
  document.querySelector("html")?.setAttribute("lang", locale);
  return i18n;
};

export const useUserLocale = (): {
  locale: WritableComputedRef<ValidLanguage | undefined>;
} => {
  const i18n = useI18n();
  const locale = computed({
    get: () => VALID_LANG.find((prefix) => i18n.locale.value.startsWith(prefix)),
    set: async (newLocale: ValidLanguage) => {
      if (!i18n.availableLocales.includes(newLocale)) await loadLocaleMessages(i18n, newLocale);
      i18n.locale.value = newLocale;
      useLocaleStore().locale = newLocale;
      Locale.use(LANG_META[newLocale].vant);
      document.querySelector("html")?.setAttribute("lang", newLocale);
    }
  });

  return { locale };
};
