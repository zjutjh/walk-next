import { useFileDialog } from "@vueuse/core";
import { scan } from "qr-scanner-wechat";
import { type BaseIssue, type BaseSchema, type InferInput, ValiError } from "valibot";
import { readonly, ref } from "vue";

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
  const { onSuccess: emitSuccess = (_) => undefined, onError: emitError = (_) => undefined } =
    options;

  /** 图片上传扫码钩子的状态 */
  const status = ref<UseUploadQrScannerStatus>("idle");

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
      // 解析原始文本
      const parseResult = parseQrCodeRawText(result.text, schema);
      if (parseResult.success) {
        emitSuccess(parseResult.output);
      } else {
        throw new ValiError(parseResult.issues);
      }
    } catch (err) {
      emitError(err);
    } finally {
      URL.revokeObjectURL(url);
    }
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

  // 监听选择文件
  onFileChange(async (files) => {
    try {
      const file = files?.[0];
      if (!file) return;
      // 尝试扫描文件中的二维码
      await scanImageFile(file);
      resetFileDialog();
      status.value = "idle";
    } catch (err) {
      emitError(err);
    }
  });

  // 监听取消选择文件
  onFileCancel(() => {
    status.value = "idle";
  });

  /** 请求用户上传二维码图片 */
  const requestUploadQrCodeImage = () => {
    try {
      if (status.value !== "idle") return;
      status.value = "pending";

      // 打开文件选择器
      openFileDialog();
    } catch (err) {
      emitError(err);
    }
  };

  return {
    status: readonly(status),
    requestUploadQrCodeImage
  };
};
