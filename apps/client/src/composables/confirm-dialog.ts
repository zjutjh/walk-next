import { ref } from "vue";

/** 全局确认框选项 */
export interface ConfirmDialogOptions {
  /** 主文案（加粗） */
  title: string;
  /** 副文案（可选，灰色小字） */
  message?: string;
  /** 确认动作按钮文案（左侧灰色按钮） */
  actionText?: string;
  /** 取消按钮文案（右侧主色按钮）；传 null 隐藏该按钮，变为纯提示弹窗 */
  dismissText?: string | null;
}

/** 模块级单例状态：全局仅挂载一个 <ConfirmDialog /> 实例 */
const isVisible = ref(false);
const dialogOptions = ref<ConfirmDialogOptions>();

/** 待决确认框的 resolve，确认/取消时调用 */
let pendingResolver: ((isConfirmed: boolean) => void) | undefined;

/**
 * 全局确认框 Composable，与全局挂载的 <ConfirmDialog /> 配合使用
 */
export const useConfirmDialog = () => {
  /** 弹出确认框：resolve true 为确认动作，false 为取消 */
  const confirmDialog = (options: ConfirmDialogOptions) => {
    // 上一个确认框尚未裁决时，以取消收尾
    pendingResolver?.(false);
    dialogOptions.value = options;
    isVisible.value = true;

    return new Promise<boolean>((resolve) => {
      pendingResolver = resolve;
    });
  };

  const settleDialog = (isConfirmed: boolean) => {
    isVisible.value = false;
    pendingResolver?.(isConfirmed);
    pendingResolver = undefined;
  };

  return {
    isVisible,
    dialogOptions,
    confirmDialog,
    /** 确认动作（左侧按钮） */
    handleConfirm: () => settleDialog(true),
    /** 取消（右侧按钮） */
    handleCancel: () => settleDialog(false)
  };
};
