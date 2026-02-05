/** 设计稿宽度 */
export const DESIGN_WIDTH = 414;
/** 屏幕宽度为设计稿宽度时，根节点的 fontSize */
export const BASE_ROOT_FONT_SIZE = 100;
/** 最大视口宽度 */
const MAX_VIEW_WIDTH = 750;

/**
 * 获取视口宽度，限制了最大视口宽度，防止在超大屏幕上字体过大
 */
function getViewWidth() {
  return Math.min(document.documentElement.clientWidth || window.innerWidth, MAX_VIEW_WIDTH);
}

function setRootFontSize() {
  const size = (getViewWidth() / DESIGN_WIDTH) * BASE_ROOT_FONT_SIZE;
  document.documentElement.style.fontSize = `${size}px`;
}

/**
 * 初始化根节点 fontSize，在应用加载最开始调用
 */
export function initializeRootFontSize() {
  setRootFontSize();
  window.addEventListener("resize", setRootFontSize);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      // 处理机型返回缓存
      setRootFontSize();
    }
  });
}

/**
 * 手动将 px 转换为 rem，适用于动态计算元素尺寸时使用
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
