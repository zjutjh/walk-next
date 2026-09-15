import "@/styles/global.scss";
import "vant/es/toast/style";
import "vant/es/dialog/style";

import { VueQueryPlugin } from "@tanstack/vue-query";
import { useEventListener } from "@vueuse/core";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { initializeRootFontSize } from "shared";
import { createApp } from "vue";

import { initI18n } from "@/composables";
import { globalQueryClient, routerInstance } from "@/configs";

import App from "./app.vue";

initializeRootFontSize();

// 断网时动态导入 chunk 失败，浏览器会缓存该失败结果，重连后 import() 仍返回缓存的失败；
// 追踪 chunk 加载错误，联网时刷新页面绕过缓存，避免离线时无限刷新
let hasChunkLoadError = false;
routerInstance.onError((error) => {
  if (error instanceof TypeError) {
    hasChunkLoadError = true;
  }
});

useEventListener("online", () => {
  if (hasChunkLoadError) {
    location.reload();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

async function bootstrap() {
  createApp(App)
    .use(createPinia().use(piniaPluginPersistedstate))
    .use(routerInstance)
    .use(VueQueryPlugin, { queryClient: globalQueryClient })
    .use(await initI18n())
    .mount("#app");
}

bootstrap();
