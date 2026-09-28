/** 校验身份证号格式及校验码，末位 x 大小写兼容 */
export const isValidIdentityChecksum = (value: string): boolean => {
  /** 校验身份证号正则 */
  const IDENTITY_PATTERN = /^\d{17}[\dX]$/i;

  /** 身份证号校验码权重（ISO 7064 MOD 11-2） */
  const CHECKSUM_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

  /** 校验码取值表，下标为加权和 mod 11 */
  const CHECKSUM_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

  const id = value.toUpperCase();
  if (!IDENTITY_PATTERN.test(id)) return false;
  const sum = CHECKSUM_WEIGHTS.reduce((acc, weight, index) => acc + weight * Number(id[index]), 0);
  return CHECKSUM_CODES[sum % 11] === id[17];
};
