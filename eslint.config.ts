import zjutjh from "@zjutjh/eslint-config";

export default zjutjh({
  vue: true,
  prettier: true,
  ts: {
    parserOptions: {
      project: ["./tsconfig.json", "**/apps/*/tsconfig.json"]
    }
  }
});
