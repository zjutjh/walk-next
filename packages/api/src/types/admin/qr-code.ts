export const QR_CODE_TYPE = {
  Team: "team",
  Checkin: "checkin"
} as const;
/** 二维码类型 */
export type QrCodeType = (typeof QR_CODE_TYPE)[keyof typeof QR_CODE_TYPE];
