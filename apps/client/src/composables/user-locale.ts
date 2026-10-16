import { storeToRefs } from "pinia";
import { Locale } from "vant";
import { computed, nextTick, type WritableComputedRef } from "vue";
import { type Composer, createI18n, type I18n, type I18nOptions, useI18n } from "vue-i18n";

import { LANG_MAP, LANG_META, VALID_LANG, type ValidLanguage } from "@/constants";
import { useLocaleStore } from "@/store/locale";

/** 装载并注册对应语言的 Vant 内置文案 */
const useVantLocale = async (lang: ValidLanguage): Promise<void> => {
  const VANT_MESSAGES = {
    "zh-Hans": () => Promise.resolve({ default: undefined }),
    "zh-Hant": () => import("vant/es/locale/lang/zh-HK"),
    en: () => import("vant/es/locale/lang/en-US")
  } satisfies Record<ValidLanguage, () => Promise<{ default?: object }>>;
  const { default: messages } = await VANT_MESSAGES[lang]();
  Locale.use(LANG_META[lang].vant, messages);
};

/** 解析初始语言：持久化偏好优先，其次按浏览器语言列表匹配受支持语言，兜底英文 */
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

/** 按需异步加载某语言的词条并注入 i18n */
const loadLocaleMessages = async (i18n: Composer, locale: ValidLanguage): Promise<void> => {
  const messages = await import(`../locales/${locale}.yaml`);
  i18n.setLocaleMessage(locale, messages.default);
  return nextTick();
};

/** 创建 i18n 实例：装载初始语言词条与 Vant 文案，并同步 html 的 lang 属性 */
export const initI18n = async (): Promise<I18n> => {
  const locale = getInitLocale();
  const lang: ValidLanguage = VALID_LANG.find((prefix) => locale.startsWith(prefix)) ?? "en";
  const messages = await import(`../locales/${lang}.yaml`);
  const i18n: I18n = createI18n({
    locale,
    fallbackLocale: "zh-Hans",
    availableLocales: [...VALID_LANG],
    globalInjection: true,
    messages: { [locale]: messages.default }
  } satisfies I18nOptions);
  await useVantLocale(lang);
  document.querySelector("html")?.setAttribute("lang", locale);
  return i18n;
};

/** 当前语言的读写入口，写入即切换 i18n、Vant 文案、持久化偏好与 html 的 lang */
export const useUserLocale = (): {
  locale: WritableComputedRef<ValidLanguage | undefined>;
} => {
  const i18n = useI18n();
  const locale = computed({
    get: () => VALID_LANG.find((prefix) => i18n.locale.value.startsWith(prefix)),
    set: async (newLocale: ValidLanguage) => {
      if (!i18n.availableLocales.includes(newLocale)) await loadLocaleMessages(i18n, newLocale);
      await useVantLocale(newLocale);
      i18n.locale.value = newLocale;
      useLocaleStore().locale = newLocale;
      document.querySelector("html")?.setAttribute("lang", newLocale);
    }
  });

  return { locale };
};
