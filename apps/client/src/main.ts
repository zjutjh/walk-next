import "./style.css";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { useUserLocale } from "@/composables";
import { globalQueryClient, routerInstance } from "@/configs";

import App from "./app.vue";

createApp(App)
  .use(routerInstance)
  .use(VueQueryPlugin, { queryClient: globalQueryClient })
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(await useUserLocale().initI18n())
  .mount("#app");
