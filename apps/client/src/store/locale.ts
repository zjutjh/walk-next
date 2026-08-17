import { defineStore } from "pinia";
import { ref } from "vue";
import { type I18n } from "vue-i18n";

import { CLIENT_PINIA_PERSIST_KEY } from "@/constants";
import type { ValidLanguage } from "@/constants/valid-languages";

export const useLocaleStore = defineStore(
  "locale",
  () => {
    const locale = ref<ValidLanguage | undefined>(undefined);
    const i18nInstance = ref<I18n | undefined>(undefined);
    return { locale, i18nInstance };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.CLIENT_USER_LOCALE,
      pick: ["locale"]
    }
  }
);
