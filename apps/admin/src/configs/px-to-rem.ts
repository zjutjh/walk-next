import { round } from "lodash-es";

import { BASE_ROOT_FONT_SIZE, DESIGN_WIDTH, MAX_VIEW_WIDTH } from "@/constants/ui";

/**
 * 获取视口宽度，限制了最大视口宽度，防止在超大屏幕上字体过大
 */
export function getViewWidth() {
  return Math.min(document.documentElement.clientWidth || window.innerWidth, MAX_VIEW_WIDTH);
}

export function setRootFontSize() {
  const size = round((getViewWidth() / DESIGN_WIDTH) * BASE_ROOT_FONT_SIZE, 3);
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
      // 部分手机浏览器执行返回操作时，会从缓存中恢复页面，此时也设置字体
      setRootFontSize();
    }
  });
}
