import { isNil } from "lodash-es";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useMapPanZoomStore } from "@/stores/map-pan-zoom-store";
import type { CampusId } from "@/walk-config";

/** 计算两点间距离 */
const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));

/** 指定校区地图的变换状态 */
export const useMapPanZoomState = (campusId: CampusId) => {
  const {
    transformValueMap,
    panCurrentPos,
    panStartPos,
    zoomCurrentTouchPoints,
    zoomStartTouchPoints
  } = storeToRefs(useMapPanZoomStore());

  /** 地图的变换值（不包含当前正在进行的变换） */
  const transformValueBase = computed({
    get: () => {
      // 内存中没有指定校区的变换值，初始化
      if (isNil(transformValueMap.value[campusId])) {
        transformValueMap.value[campusId] = {
          x: 0,
          y: 0,
          scale: 1
        };
      }
      return transformValueMap.value[campusId];
    },
    set: (value) => (transformValueMap.value[campusId] = value)
  });

  /** 地图的变换值（包含当前正在进行的变换） */
  const transformValuePending = computed(
    () =>
      ({
        x: transformValueBase.value.x + pendingPanX.value,
        y: transformValueBase.value.y + pendingPanY.value,
        scale: transformValueBase.value.scale * pendingZoom.value
      }) as const
  );

  /** 地图的变换值 */
  const transformValue = {
    /** 地图的变换值（不包含当前正在进行的变换） */
    base: transformValueBase,
    /** 地图的变换值（包含当前正在进行的变换） */
    pending: transformValuePending
  };

  /** 当前正在进行的平移产生的地图X坐标累加值 */
  const pendingPanX = computed(() => panCurrentPos.value.x - panStartPos.value.x);
  /** 当前正在进行的平移产生的地图Y坐标累加值 */
  const pendingPanY = computed(() => panCurrentPos.value.y - panStartPos.value.y);

  /** 当前正在进行的缩放产生的比例累乘系数 */
  const pendingZoom = computed(() => {
    /** 当前两触点的距离 比 初始两触点的距离 */
    const zoomScale =
      getDistance(
        zoomCurrentTouchPoints.value.x1,
        zoomCurrentTouchPoints.value.y1,
        zoomCurrentTouchPoints.value.x2,
        zoomCurrentTouchPoints.value.y2
      ) /
      getDistance(
        zoomStartTouchPoints.value.x1,
        zoomStartTouchPoints.value.y1,
        zoomStartTouchPoints.value.x2,
        zoomStartTouchPoints.value.y2
      );
    if (!zoomScale || !isFinite(zoomScale)) return 1;
    return zoomScale;
  });

  return {
    transformValue,
    pendingPanX,
    pendingPanY,
    pendingZoom
  };
};
