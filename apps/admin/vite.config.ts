import { VantResolver } from "@vant/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      Icons({
        compiler: "vue3"
      }),
      AutoImport({
        resolvers: [VantResolver(), IconsResolver()],
        dts: "types/auto-imports.d.ts"
      }),
      Components({
        resolvers: [VantResolver(), IconsResolver()],
        dts: "types/components.d.ts"
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_HOST,
          changeOrigin: true
        }
      }
    },
    build: {
      target: "es2015"
    }
  };
});
