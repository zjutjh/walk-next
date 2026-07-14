import { cloneDeep } from "lodash-es";
import { defineStore } from "pinia";
import { ref } from "vue";

import type { CampusId } from "@/walk-config";

/** 地图的变化值 */
export interface MapTransform {
  /** X平移 */
  x: number;
  /** Y平移 */
  y: number;
  /** 缩放比例 */
  scale: number;
}

/** 地图的变换状态Store */
export const useMapPanZoomStore = defineStore("mapPanZoom", () => {
  /** 校区ID-地图变换值 映射表 */
  const transformValueMap = ref<Partial<Record<CampusId, MapTransform>>>({});

  /** 是否正在平移 */
  const isPanning = ref(false);
  /** 当前正在进行的平移开始时的触点坐标 */
  const panStartPos = ref({
    x: 0,
    y: 0
  });
  /** 当前正在进行的平移的触点坐标 */
  const panCurrentPos = ref(cloneDeep(panStartPos.value));

  /** 是否正在缩放 */
  const isZooming = ref(false);
  /** 当前正在进行的缩放开始时的触点坐标 */
  const zoomStartTouchPoints = ref({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  });
  /** 当前正在进行的缩放目前的触点坐标 */
  const zoomCurrentTouchPoints = ref(cloneDeep(zoomStartTouchPoints.value));

  return {
    transformValueMap,
    isPanning,
    isZooming,
    panStartPos,
    panCurrentPos,
    zoomStartTouchPoints,
    zoomCurrentTouchPoints
  };
});
