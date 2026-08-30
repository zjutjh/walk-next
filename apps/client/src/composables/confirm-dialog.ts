import { ref } from "vue";

export interface ConfirmDialogOptions {
  /** 主文案 */
  title: string;
  /** 副文案 */
  message?: string;
  /** 确认按钮文案，默认"确认" */
  actionText?: string;
  /** 取消按钮文案，默认"再想想"；传 null 隐藏按钮，变为纯提示弹窗 */
  dismissText?: string | null;
}

/** 模块级单例状态：全局仅挂载一个 <ConfirmDialog /> */
const isVisible = ref(false);
const dialogOptions = ref<ConfirmDialogOptions>();
let pendingResolver: ((isConfirmed: boolean) => void) | undefined;

/** 弹出全局确认框：resolve true=确认 / false=取消 */
export const confirmDialog = (options: ConfirmDialogOptions) => {
  // 上一个确认框未裁决时以取消收尾
  pendingResolver?.(false);
  dialogOptions.value = options;
  isVisible.value = true;

  return new Promise<boolean>((resolve) => {
    pendingResolver = resolve;
  });
};

const settle = (isConfirmed: boolean) => {
  isVisible.value = false;
  pendingResolver?.(isConfirmed);
  pendingResolver = undefined;
};

/** 仅供 <ConfirmDialog /> 绑定状态与裁决 */
export const useConfirmDialog = () => ({ isVisible, dialogOptions, settle });
