import { ClientQrCodeType } from "api/types/client";
import {
  type BaseIssue,
  type BaseSchema,
  check,
  integer,
  number,
  object,
  parse,
  parseJson,
  pipe,
  string,
  uuid,
  value
} from "valibot";

const BASE_MSG = "二维码格式错误";

/** 团队码类型模式 */
export const TeamQrCodeSchema = object(
  {
    type: pipe(number(BASE_MSG), value(ClientQrCodeType.Team, "类型错误\n请扫团队码")),
    team_id: pipe(number(BASE_MSG), integer(BASE_MSG)),
    time: pipe(number(BASE_MSG), integer(BASE_MSG))
  },
  BASE_MSG
);

/** 签到码类型模式 */
export const CheckinQrCodeSchema = object(
  {
    type: pipe(number(BASE_MSG), value(ClientQrCodeType.Checkin, "类型错误\n请扫签到码")),
    code: pipe(string(BASE_MSG), uuid("签到码无效"))
  },
  BASE_MSG
);

/** 个人码类型模式 */
export const MemberQrCodeSchema = object(
  {
    type: pipe(number(BASE_MSG), value(3, "类型错误\n请扫个人码")),
    name: string(BASE_MSG),
    jwt: pipe(
      string(BASE_MSG),
      // JWT格式校验
      check((input) => {
        try {
          const splittedInput = input.split(".");
          if (!splittedInput[0] || !splittedInput[1] || !splittedInput[2]) return false;
          // 检查前缀是否存在 头部是否为Base64编码且满足JSON格式
          JSON.parse(window.atob(splittedInput[0].split("Bearer ").at(1) ?? ""));
          // 检查载荷是否为Base64编码且满足JSON格式
          JSON.parse(window.atob(splittedInput[1]));
          return true;
        } catch {
          return false;
        }
      }, "身份凭证无效")
    ),
    time: pipe(number(BASE_MSG), integer(BASE_MSG))
  },
  BASE_MSG
);

/** 扫码钩子的通用配置 */
export interface UseQrScannerOptions<TData> {
  /** 扫码成功回调 */
  onSuccess?: (data: TData) => void;
  /** 扫码失败回调 */
  onError?: (err: Error) => void;
}

/** 解析二维码文本，失败时会抛出ValiError  */
export const parseQrCodeRawText = <
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>
>(
  rawText: string,
  schema: TSchema
) => parse(pipe(string(), parseJson(undefined, "二维码格式错误"), schema), rawText);

/** 解析个人码中的JWT */
export const parseJwt = (jwt: string) => {
  // 去除前缀
  const pureJwt = jwt.split("Bearer ").at(1);
  if (!pureJwt) return;
  // 分割JWT
  const splittedJwt = pureJwt.split(".");
  if (!splittedJwt[0] || !splittedJwt[1] || !splittedJwt[2]) return;
  // 解码
  return {
    header: JSON.parse(window.atob(splittedJwt[0])),
    payload: JSON.parse(window.atob(splittedJwt[1])),
    signature: splittedJwt[2]
  };
};
