import { ClientQrCodeType } from "api/types/client";
import {
  type BaseIssue,
  type BaseSchema,
  integer,
  message,
  number,
  object,
  parseJson,
  pipe,
  safeParse,
  string,
  value
} from "valibot";

/** 团队码类型模式 */
export const TeamQrCodeSchema = object(
  {
    type: message(pipe(number(), value(ClientQrCodeType.Team)), "类型错误\n请扫团队码"),
    team_id: message(pipe(number(), integer()), "团队ID格式错误")
  },
  "团队码格式错误"
);

/** 签到码类型模式 */
export const CheckinQrCodeSchema = object(
  {
    type: message(pipe(number(), value(ClientQrCodeType.Checkin)), "类型错误\n请扫签到码"),
    code: message(pipe(string()), "签到码无效")
  },
  "签到码格式错误"
);

/** 个人码类型模式 */
export const MemberQrCodeSchema = object(
  {
    type: message(pipe(number(), value(ClientQrCodeType.Member)), "类型错误\n请扫个人码"),
    user_id: message(pipe(number(), integer()), "人员ID格式错误")
  },
  "个人码格式错误"
);

export interface UseQrScannerErrorOptions {
  /** 是否是阻断性错误 */
  blocking?: boolean;
}

/** 扫码Composable的通用配置 */
export interface UseQrScannerOptions<TData> {
  /** 扫码成功回调 */
  onSuccess?: (data: TData) => void;
  /** 出错回调 */
  onError?: (err: unknown, errOptions?: UseQrScannerErrorOptions) => void;
}

/** 转译可能与视频或摄像头相关的错误 */
export const humanizeScannerErr = (err: Error) => {
  let humanizedMsg: string;
  switch (err.name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      humanizedMsg = "获取摄像头权限失败，请检查设置";
      break;
    case "NotFoundError":
    case "DevicesNotFoundError":
    case "OverconstrainedError":
      humanizedMsg = "连接摄像头失败，请刷新重试";
      break;
    case "NotReadableError":
      humanizedMsg = "无法播放摄像头画面";
      break;
    case "AbortError":
      humanizedMsg = "摄像头画面播放中断";
      break;
    case "TrackStartError":
      humanizedMsg = "摄像头被占用";
      break;
    default:
      return err;
  }
  return new Error(humanizedMsg, { cause: err });
};

/** 解析二维码文本  */
export const parseQrCodeRawText = <
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
>(
  rawText: string,
  schema: TSchema
) => safeParse(pipe(string(), parseJson(undefined, "二维码格式错误"), schema), rawText);
