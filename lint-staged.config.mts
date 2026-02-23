import type { Configuration } from "lint-staged";

export default {
  "*.{(m)ts,(m)js,vue,css,scss,json,html}": ["pnpm run lint"]
} satisfies Configuration;
