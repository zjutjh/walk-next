import type { UserHome } from "api/types/client";
import { createRequiredRuleWithMessage } from "shared";
import type { FieldRule } from "vant";

import { isValidIdentity } from "@/utils/validation";

/** 大陆手机号 */
export const TEL_PATTERN = /^1[3-9]\d{9}$/;

/** 电话号码校验规则：必填且须匹配大陆手机号 */
export const getTelRules = (t: (key: string) => string): FieldRule[] => [
  ...createRequiredRuleWithMessage(t("请输入电话号码")),
  { pattern: TEL_PATTERN, message: t("请输入正确的电话号码") }
];

/** 校验证件号码规则，home 缺省时按大陆身份证校验 */
export const getIdentityRules = (t: (key: string) => string, home?: UserHome): FieldRule[] => [
  {
    validator: (value: string) => !value || isValidIdentity(value, home),
    message: t("请输入正确的证件号码")
  }
];
