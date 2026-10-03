export interface DefaultLayoutProps {
  /** 是否显示导航栏
   * @default true
   */
  showNavbar?: boolean;
  /** 是否显示logo
   * @default false
   */
  showLogo?: boolean;
  /** main区域是否不添加内边距
   * @default false
   */
  noPadding?: boolean;
  /** 背景装饰图变体
   * @default "default"
   */
  bgDecorationVariant?: "default" | "topAndBottom";
}
