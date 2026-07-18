import "@/global.scss";
import "vant/es/toast/style";
import "vant/es/dialog/style";

import { VueQueryPlugin } from "@tanstack/vue-query";
import dayjs from "dayjs";
import zhCn from "dayjs/locale/zh-cn";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { ready } from "qr-scanner-wechat";
import { createApp } from "vue";

import App from "@/app.vue";
import { globalQueryClient, initializeRootFontSize, routerInstance } from "@/configs";

initializeRootFontSize();

dayjs.locale(zhCn);

createApp(App)
  .use(routerInstance)
  .use(VueQueryPlugin, { queryClient: globalQueryClient })
  .use(createPinia().use(piniaPluginPersistedstate))
  .mount("#app");

// 预加载扫码模块
try {
  requestIdleCallback(() => {
    try {
      ready();
    } catch (err) {
      console.error(err);
    }
  });
} catch {
  console.warn("'requestIdleCallback' is not supported.");
}
