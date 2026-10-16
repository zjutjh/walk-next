import { showConfirmDialog } from "vant";

export interface ConfirmActionOptions {
  title: string;
  message: string;
  action: () => Promise<unknown>;
  onSuccess: () => Promise<unknown> | unknown;
}

/** 确认后执行 action，成功后执行 onSuccess；用户取消则静默结束 */
export const confirmAction = (options: ConfirmActionOptions) =>
  showConfirmDialog({
    title: options.title,
    message: options.message,
    theme: "round-button",
    beforeClose: async (action) => {
      if (action !== "confirm") return true;

      try {
        await options.action();
        return true;
      } catch {
        return false;
      }
    }
  })
    .then(async () => {
      await options.onSuccess();
    })
    .catch(() => undefined);
