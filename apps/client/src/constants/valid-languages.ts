export const VALID_LANG = ["zh-Hans", "zh-Hant", "en"] as const;

export type ValidLanguage = (typeof VALID_LANG)[number];

export type LangMeta = {
  name: string;
  short: string;
  vant: string;
};

export const LANG_META: Record<ValidLanguage, LangMeta> = {
  "zh-Hans": { name: "简体中文", short: "简", vant: "zh-CN" },
  "zh-Hant": { name: "繁體中文", short: "繁", vant: "zh-TW" },
  en: { name: "English", short: "En", vant: "en-US" }
} as const;

export const LANG_MAP: Record<string, ValidLanguage> = {
  zh: "zh-Hans",
  "zh-cn": "zh-Hans",
  "zh-sg": "zh-Hans",
  "zh-tw": "zh-Hant",
  "zh-hk": "zh-Hant",
  "zh-mo": "zh-Hant"
} as const;
