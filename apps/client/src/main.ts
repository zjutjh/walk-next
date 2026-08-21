import "./style.css";

import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { useUserLocale } from "@/composables";
import { routerInstance } from "@/configs";

import App from "./app.vue";

createApp(App)
  .use(routerInstance)
  .use(createPinia().use(piniaPluginPersistedstate))
  .use(useUserLocale().getInstance())
  .mount("#app");
