import type { FieldRule } from "vant";

/** 生成一个必填字段规则，可自定义错误消息 */
export const createRequiredRuleWithMessage = (msg: string): FieldRule[] => [
  { required: true, message: msg }
];
