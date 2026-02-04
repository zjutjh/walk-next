import "./global.scss";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { createApp } from "vue";

import App from "./app.vue";
import { routerConfig } from "./configs/router";
import { globalQueryClient } from "./configs/vue-query";

createApp(App)
  .use(routerConfig)
  .use(VueQueryPlugin, { queryClient: globalQueryClient })
  .mount("#app");
