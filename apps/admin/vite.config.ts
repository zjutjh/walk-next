import { VantResolver } from "@vant/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [VantResolver()],
        dts: "types/auto-imports.d.ts"
      }),
      Components({
        resolvers: [VantResolver()],
        dts: "types/components.d.ts"
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    },
    server: {
      fs: {
        allow: [
          path.resolve(__dirname, "./"),
          path.resolve(__dirname, "../../packages/walk-config")
        ]
      },
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
