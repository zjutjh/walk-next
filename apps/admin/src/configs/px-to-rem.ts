/** 设计稿宽度 */
export const DESIGN_WIDTH = 414;
/** 屏幕宽度为设计稿宽度时，根节点的 fontSize */
export const BASE_ROOT_FONT_SIZE = 100;

/**
 * 初始化根节点 fontSize，在应用加载最开始调用
 */
export function initializeRootFontSize() {
  function setRem() {
    const currentWidth = document.documentElement.clientWidth || window.innerWidth;
    const rem = (currentWidth / DESIGN_WIDTH) * BASE_ROOT_FONT_SIZE;
    document.documentElement.style.fontSize = `${rem}px`;
  }
  setRem();
  window.addEventListener("resize", setRem);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      // 处理机型返回缓存
      setRem();
    }
  });
}

/**
 * 手动将 px 转换为 rem，适用于动态计算 px 值时使用
 */
export function pxToRem(px: number, base = BASE_ROOT_FONT_SIZE): `${number}rem` {
  return `${(px / DESIGN_WIDTH) * base}rem`;
}
