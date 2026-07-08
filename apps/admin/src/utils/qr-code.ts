import { QR_CODE } from "api/types/admin";
import { enum_, type InferOutput, nonEmpty, object, parse, parseJson, pipe, string } from "valibot";

/** 二维码类型模式 */
const QrCodeSchema = object(
  {
    code_type: enum_(QR_CODE, "未知的二维码类型"),
    content: pipe(string("二维码格式错误"), nonEmpty("二维码内容为空"))
  },
  "二维码格式错误"
);

/** 二维码数据 */
export type QrCodeData = InferOutput<typeof QrCodeSchema>;

/** 扫码钩子的通用配置 */
export interface UseQrScannerOptions {
  /** 扫码成功回调 */
  onSuccess?: (data: QrCodeData) => void;
  /** 扫码失败回调 */
  onError?: (err: Error) => void;
}

/** 解析二维码文本，失败时会抛出ValiError  */
export const parseQrCodeRawText = (rawText: string) =>
  parse(pipe(string(), parseJson(undefined, "二维码格式错误"), QrCodeSchema), rawText);
