export const QR_CODE = {
  Team: "team",
  Checkin: "checkin"
} as const;
/** 二维码类型 */
export type QrCodeType = (typeof QR_CODE)[keyof typeof QR_CODE];
