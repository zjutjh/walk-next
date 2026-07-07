import type { FieldRule, FieldType } from "vant";

/** 输入弹窗组件 字段配置 */
export interface PromptDialogFieldConfig {
  /** 字段标签 */
  label: string;
  /** 字段输入框的placeholder */
  placeholder?: string;
  /** 字段输入框的type */
  type?: FieldType;
  /** 字段输入框的inputmode */
  inputmode?: "tel" | "url" | "text" | "email" | "search" | "none" | "numeric" | "decimal";
  /** 字段校验规则 */
  rules?: FieldRule[];
}

/** 输入弹窗组件Props */
export interface PromptDialogProps {
  /** 弹窗标题 */
  title: string;
  /** 弹窗描述 */
  description?: string;
  /** 字段配置 */
  fieldConfig: Record<string, PromptDialogFieldConfig>;
  /** 是否禁用确认按钮 */
  confirmDisabled?: boolean;
}
