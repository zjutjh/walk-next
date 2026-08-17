export const VALID_LANG = ["zh-Hans", "zh-Hant", "en"] as const;

export type ValidLanguage = (typeof VALID_LANG)[number];

export const LANG_MAP: Record<string, ValidLanguage> = {
  zh: "zh-Hans",
  "zh-cn": "zh-Hans",
  "zh-sg": "zh-Hans",
  "zh-tw": "zh-Hant",
  "zh-hk": "zh-Hant",
  "zh-mo": "zh-Hant"
} as const;

export const LANG_DISPLAY_NAME: Record<ValidLanguage, string> = {
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  en: "English"
};

export const LANG_DISPLAY_NAME_SHORT: Record<ValidLanguage, string> = {
  "zh-Hans": "简",
  "zh-Hant": "繁",
  en: "En"
};
