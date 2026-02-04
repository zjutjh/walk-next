import pxToRemPlugin from "postcss-pxtorem";

import { BASE_ROOT_FONT_SIZE } from "./src/configs/px-to-rem.ts";

export default {
  plugins: [
    pxToRemPlugin({
      rootValue: BASE_ROOT_FONT_SIZE,
      propList: ["*"]
    })
  ]
};
