import { clamp, round } from "lodash-es";

import {
  BASE_ROOT_FONT_SIZE,
  DESIGN_WIDTH,
  MAX_UI_SCALE_RATIO,
  MIN_UI_SCALE_RATIO
} from "@/constants";

/**
 * 获取UI缩放比例，限制了上下限
 */
export function getUiScaleRatio() {
  const scaleRatio = (document.documentElement.clientWidth || window.innerWidth) / DESIGN_WIDTH;
  return clamp(scaleRatio, MIN_UI_SCALE_RATIO, MAX_UI_SCALE_RATIO);
}

export function setRootFontSize() {
  const size = round(getUiScaleRatio() * BASE_ROOT_FONT_SIZE, 3);
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
