import pxToRemPlugin from "postcss-pxtorem";

import { BASE_ROOT_FONT_SIZE, DESIGN_WIDTH } from "./src/configs/px-to-rem.ts";

/**
 * Vant 组件库的设计稿宽度
 * @see https://vant-ui.github.io/vant/#/zh-CN/advanced-usage#qi-ta-she-ji-gao-chi-cun
 */
const VANT_DESIGN_WIDTH = 375;

export default {
  plugins: [
    pxToRemPlugin({
      rootValue({ file }) {
        // 组件库的设计稿宽度和项目的不一样，要按一定比例缩放
        return file.indexOf("vant") !== -1
          ? (VANT_DESIGN_WIDTH / DESIGN_WIDTH) * BASE_ROOT_FONT_SIZE
          : BASE_ROOT_FONT_SIZE;
      },
      propList: ["*"],
      // 小于 2px 的不转成 rem，防止实际渲染不够 1px，展示出问题
      minPixelValue: 2
    })
  ]
};
