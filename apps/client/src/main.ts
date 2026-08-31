import "@/styles/global.scss";
import "vant/es/toast/style";
import "vant/es/dialog/style";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import { initI18n } from "@/composables";
import { globalQueryClient, initializeRootFontSize, routerInstance } from "@/configs";

initializeRootFontSize();

import App from "./app.vue";

async function bootstrap() {
  createApp(App)
    .use(routerInstance)
    .use(VueQueryPlugin, { queryClient: globalQueryClient })
    .use(createPinia().use(piniaPluginPersistedstate))
    .use(await initI18n())
    .mount("#app");
}

bootstrap();
