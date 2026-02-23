import "./global.scss";

import { VueQueryPlugin } from "@tanstack/vue-query";
import dayjs from "dayjs";
import zhCn from "dayjs/locale/zh-cn";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./app.vue";
import { globalQueryClient, initializeRootFontSize, routerConfig } from "./configs";

initializeRootFontSize();

dayjs.locale(zhCn);

createApp(App)
  .use(routerConfig)
  .use(VueQueryPlugin, { queryClient: globalQueryClient })
  .use(createPinia())
  .mount("#app");
