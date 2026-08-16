import { variant } from "valibot";

import { CheckinQrCodeSchema, MemberQrCodeSchema, TeamQrCodeSchema } from "@/utils";

/** 打卡使用的二维码的类型模式，包括团队码、签到码、个人码 */
export const checkinQrCodeSchema = variant(
  "type",
  [TeamQrCodeSchema, CheckinQrCodeSchema, MemberQrCodeSchema],
  "类型错误\n请扫团队码、\n签到码\n或队员个人码"
);
