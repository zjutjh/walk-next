import "./global.scss";

import { VueQueryPlugin } from "@tanstack/vue-query";
import dayjs from "dayjs";
import zhCn from "dayjs/locale/zh-cn";
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "./app.vue";
import { initializeRootFontSize } from "./configs/px-to-rem";
import { routerConfig } from "./configs/router";
import { globalQueryClient } from "./configs/vue-query";

initializeRootFontSize();

dayjs.locale(zhCn);

createApp(App)
  .use(routerConfig)
  .use(VueQueryPlugin, { queryClient: globalQueryClient })
  .use(createPinia())
  .mount("#app");
