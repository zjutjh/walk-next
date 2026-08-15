/** 打卡二维码类型 */
export type CheckinQrCodeType = "team" | "checkin";

/** 打卡非阻断性错误的类型 */
export type CheckinException = "" | "duplicate" | "wrong_direction";
