import { variant } from "valibot";

import { CheckinQrCodeSchema, TeamQrCodeSchema } from "@/utils";

/** 打卡使用的二维码的类型模式，包括团队码和签到码 */
export const checkinQrCodeSchema = variant(
  "type",
  [TeamQrCodeSchema, CheckinQrCodeSchema],
  "类型错误\n请扫团队码\n或签到码"
);
