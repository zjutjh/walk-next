import type { UserHome } from "api/types/client";

/** 非大陆户籍证件号码格式：港澳通行证 H/M + 8 或 10 位数字，台湾通行证 8 位数字或前 10 位数字加至多 4 位字母数字，护照为 5-12 位字母数字 */
const IDENTITY_PATTERNS = {
  // eslint-disable-next-line camelcase
  hong_kong_macao: /^[HM]\d{8}(\d{2})?$/,
  international: /^[\dA-Za-z]{5,12}$/,
  taiwan: /^(\d{8}|\d{10}[\dA-Za-z]{0,4})$/
} as const;

/** 校验出生日期，须为 1901-01-01 至 2099-12-31 之间的真实日期 */
const isValidBirthDate = (id: string): boolean => {
  const year = Number(id.slice(6, 10));
  const month = Number(id.slice(10, 12));
  const day = Number(id.slice(12, 14));
  if (year < 1901 || year > 2099) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
};

/** 校验大陆身份证号格式、出生日期及校验码，末位 x 大小写兼容 */
const isValidMainlandIdentity = (value: string): boolean => {
  /** 校验身份证号正则 */
  const IDENTITY_PATTERN = /^\d{17}[\dX]$/i;

  /** 身份证号校验码权重（ISO 7064 MOD 11-2） */
  const CHECKSUM_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

  /** 校验码取值表，下标为加权和 mod 11 */
  const CHECKSUM_CODES = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

  const id = value.toUpperCase();
  if (!IDENTITY_PATTERN.test(id) || !isValidBirthDate(id)) return false;
  const sum = CHECKSUM_WEIGHTS.reduce((acc, weight, index) => acc + weight * Number(id[index]), 0);
  return CHECKSUM_CODES[sum % 11] === id[17];
};

/** 校验证件号码，mainland 走身份证校验，其余按户籍对应的证件格式校验 */
export const isValidIdentity = (value: string, home: UserHome = "mainland"): boolean =>
  home === "mainland" ? isValidMainlandIdentity(value) : IDENTITY_PATTERNS[home].test(value);
