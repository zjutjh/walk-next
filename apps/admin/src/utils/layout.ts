import { BASE_ROOT_FONT_SIZE, DESIGN_WIDTH, getViewWidth } from "@/configs/px-to-rem";

/**
 * 手动将 px 转换为 rem，需要动态计算元素尺寸才用，一般不用
 */
export function pxToRem(px: number): `${number}rem` {
  return `${(px / DESIGN_WIDTH) * BASE_ROOT_FONT_SIZE}rem`;
}

/**
 * 手动将 px 缩放为当前视口宽度下合适的 px 尺寸
 *
 * 优先使用 `pxToRem`，如果场景不允许消费 rem 单位的尺寸，就使用这个
 *
 * 计算出的尺寸不会随屏幕宽度变化有响应式关系
 */
export function pxToSize(px: number): number {
  return (px / DESIGN_WIDTH) * getViewWidth();
}
