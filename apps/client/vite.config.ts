import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import mdx from "@mdx-js/rollup";
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
    base: env.VITE_BASE_PATH,
    plugins: [
      {
        enforce: "pre",
        ...mdx({
          jsxImportSource: "vue"
        })
      },
      vue({ include: /\.(vue|mdx|md)$/ }),
      VueI18nPlugin({
        include: [path.resolve(__dirname, "./src/locales/**")],
        treeShaking: true
      }),
      Icons({
        compiler: "vue3"
      }),
      AutoImport({
        resolvers: [VantResolver(), IconsResolver()],
        dts: "types/auto-imports.d.ts"
      }),
      Components({
        dirs: [],
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
