interface ImportMetaEnv {
  /** 开发服务器的 API 代理目标地址 */
  readonly VITE_HOST: string;
  /** 部署的基础路径，以斜杠开头和结尾 */
  readonly VITE_BASE_PATH: string;
  /** 反馈问卷 URL */
  readonly VITE_FEEDBACK_QA_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
