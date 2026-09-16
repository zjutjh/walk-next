import { createRequiredRuleWithMessage } from "shared";
import type { FieldRule } from "vant";
import { useI18n } from "vue-i18n";

/** 校验电话号码正则 */
export const TEL_PATTERN = /^1[3-9]\d{9}$/;

/** 校验电话号码规则 */
export function useTelRules(): FieldRule[] {
  const { t } = useI18n();
  return [
    ...createRequiredRuleWithMessage(t("请输入电话号码")),
    { pattern: TEL_PATTERN, message: t("请输入正确的电话号码") }
  ];
}

/** 校验身份证号正则 */
export const IDENTITY_PATTERN = /^\d{17}[\dX]$/i;

/** 校验身份证号规则 */
export function useIdentityRules(): FieldRule[] {
  const { t } = useI18n();
  return [
    {
      validator: (value: string) => !value || IDENTITY_PATTERN.test(value),
      message: t("请输入正确的身份证号码")
    }
  ];
}
