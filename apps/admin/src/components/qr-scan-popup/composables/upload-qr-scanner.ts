import { useFileDialog } from "@vueuse/core";
import { scan } from "qr-scanner-wechat";
import type { BaseIssue, BaseSchema, InferInput } from "valibot";
import { onBeforeUnmount, ref } from "vue";

import { parseQrCodeRawText, type UseQrScannerOptions } from "@/utils";

export type UseUploadQrScannerOptions<TData> = UseQrScannerOptions<TData>;

/** 图片上传扫码钩子的状态
 * @enum idle 闲置
 * @enum pending 等待用户选择文件，此时重复调用会被忽略 */
export type UseUploadQrScannerStatus = "idle" | "pending";

/** 图片上传扫码 */
export const useUploadQrScanner = <
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
>(
  options: UseUploadQrScannerOptions<InferInput<TSchema>> = {},
  schema: TSchema
) => {
  // 初始化参数
  const { onSuccess = (_) => undefined, onError = (_) => undefined } = options;

  /** 图片上传扫码钩子的状态 */
  const status = ref<UseUploadQrScannerStatus>("idle");

  /** 处理扫码成功 */
  const handleSuccess = (qrCodeData: InferInput<TSchema>) => {
    onSuccess(qrCodeData);
  };

  /** 处理错误 */
  const handleError = (err: unknown) => {
    if (!(err instanceof Error)) {
      err = new Error(String(err));
    }
    onError(err as Error);
  };

  /** 处理扫描结果原始文本 */
  const handleScanRawText = (rawText: string | null | undefined) => {
    if (!rawText) return;

    // 解析原始文本
    const qrCodeData = parseQrCodeRawText(rawText, schema);

    // 解析成功，停止扫码
    handleSuccess(qrCodeData);
  };

  // 文件选择器
  const {
    open: openFileDialog,
    onChange: onFileChange,
    onCancel: onFileCancel,
    reset: resetFileDialog
  } = useFileDialog({
    accept: "image/*",
    multiple: false
  });

  /** 处于pending的选择文件Promise的reject，这是为了防止组件卸载时出现悬置Promise */
  let uploadFilePromiseReject: ((reason?: unknown) => void) | null = null;

  /** 打开文件选择器，获取上传的文件 */
  const getUploadFile = () => {
    // 创建选择文件Promise
    return new Promise<File | null>((resolve, reject) => {
      uploadFilePromiseReject = reject;

      /** 清除事件钩子 */
      let clearEventHook = () => undefined;

      /** 选择文件 */
      const changeHook = onFileChange((files) => {
        clearEventHook();
        const file = files?.[0];
        resetFileDialog();
        if (file) {
          resolve(file);
        } else {
          reject(new Error("未选择文件"));
        }
      });
      /** 取消选择文件 */
      const cancelHook = onFileCancel(() => {
        clearEventHook();
        resolve(null);
      });
      /** 清除事件钩子 */
      clearEventHook = () => {
        changeHook.off();
        cancelHook.off();
      };

      // 打开文件选择器
      openFileDialog();
    }).finally(() => {
      uploadFilePromiseReject = null;
    });
  };

  /** 尝试扫描图片文件中的二维码 */
  const scanImageFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    try {
      image.decoding = "async";
      image.src = url;
      // 等待图片加载
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = (err) => reject(new Error("图片加载失败", { cause: err }));
      });
      // 尝试扫描二维码
      const result = await scan(image);
      if (!result.text) {
        throw new Error("未识别到二维码");
      }
      // 处理扫描结果原始文本
      handleScanRawText(result.text);
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  /** 请求用户上传二维码图片 */
  const requestUploadQrCodeImage = async () => {
    try {
      if (status.value !== "idle") return;
      status.value = "pending";

      // 获取用户上传的文件
      const file = await getUploadFile();
      // 用户取消
      if (!file) return;
      // 尝试扫描文件中的二维码
      await scanImageFile(file);
    } catch (err) {
      handleError(err);
    } finally {
      status.value = "idle";
    }
  };

  onBeforeUnmount(() => {
    // 若存在处于pending的选择文件Promise，将其reject
    if (uploadFilePromiseReject) {
      uploadFilePromiseReject(new Error("取消上传"));
    }
  });

  return {
    status,
    requestUploadQrCodeImage
  };
};
