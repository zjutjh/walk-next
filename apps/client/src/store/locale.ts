import { defineStore } from "pinia";
import { ref } from "vue";

import { CLIENT_PINIA_PERSIST_KEY } from "@/constants";
import type { ValidLanguage } from "@/constants/valid-languages";

export const useLocaleStore = defineStore(
  "locale",
  () => {
    const locale = ref<ValidLanguage | undefined>(undefined);
    return { locale };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.CLIENT_USER_LOCALE,
      pick: ["locale"]
    }
  }
);
