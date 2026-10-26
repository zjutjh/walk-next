/** 取错误消息；非 Error 实例或消息为空时用 fallback */
export const getErrorMessage = (error: unknown, fallback: string): string =>
  (error instanceof Error && error.message) || fallback;
