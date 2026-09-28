import { createRequiredRuleWithMessage } from "shared";
import type { FieldRule } from "vant";

import { isValidIdentityChecksum } from "@/utils/validation";

/** 校验电话号码正则 */
export const TEL_PATTERN = /^1[3-9]\d{9}$/;

/** 校验电话号码规则 */
export const getTelRules = (t: (key: string) => string): FieldRule[] => [
  ...createRequiredRuleWithMessage(t("请输入电话号码")),
  { pattern: TEL_PATTERN, message: t("请输入正确的电话号码") }
];

/** 校验身份证号规则 */
export const getIdentityRules = (t: (key: string) => string): FieldRule[] => [
  {
    validator: (value: string) => !value || isValidIdentityChecksum(value),
    message: t("请输入正确的身份证号码")
  }
];
