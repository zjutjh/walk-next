import "./global.scss";

import { createApp } from "vue";

import App from "./app.vue";
import { routerConfig } from "./configs/router";

createApp(App).use(routerConfig).mount("#app");
