import "./style.css";

import messages from "@intlify/unplugin-vue-i18n/messages";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";

import { useUserLocale } from "@/composables";
import { VALID_LANG, type ValidLanguage } from "@/constants";

import App from "./app.vue";

console.info(messages);

createApp(App)
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(
    createI18n({
      locale: useUserLocale().locale.value,
      fallbackLocale: "zh-Hans" as ValidLanguage,
      availableLocales: VALID_LANG,
      globalInjection: true,
      messages
    })
  )
  .mount("#app");
