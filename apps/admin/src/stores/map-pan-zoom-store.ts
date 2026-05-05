import { cloneDeep, defaultTo, isNil } from "lodash-es";
import { defineStore } from "pinia";
import { computed, type Ref, ref, toRef } from "vue";

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

/** 地图的变换状态 */
export const useMapPanZoomStore = defineStore("mapPanZoom", () => {
  /** 地图的变换值 */
  const transformValue = ref<Partial<Record<CampusId, MapTransform>>>({});
  /** 获取内存中存储的指定校区的地图变换值 */
  const getTransformValue = (campusId: CampusId) => {
    // 内存中没有指定校区的变换值，初始化
    if (isNil(transformValue.value[campusId])) {
      transformValue.value[campusId] = {
        x: 0,
        y: 0,
        scale: 1
      };
    }

    const transformValueBase = toRef(transformValue.value, campusId) as Ref<MapTransform>;
    const transformValuePending = computed(
      () =>
        ({
          x: transformValueBase.value.x + pendingPanX.value,
          y: transformValueBase.value.y + pendingPanY.value,
          scale: transformValueBase.value.scale * pendingZoom.value
        }) as const
    );

    return {
      /** 地图的变换值（不包含当前正在进行的变换） */
      base: transformValueBase,
      /** 地图的变换值（包含当前正在进行的变换） */
      pending: transformValuePending
    };
  };

  /** 是否正在平移 */
  const isPanning = ref(false);
  /** 当前正在进行的平移开始时的触点坐标 */
  const panStartPos = ref({
    x: 0,
    y: 0
  });
  /** 当前正在进行的平移的触点坐标 */
  const panCurrentPos = ref(cloneDeep(panStartPos.value));
  /** 当前正在进行的平移产生的地图X坐标累加值 */
  const pendingPanX = computed(() => panCurrentPos.value.x - panStartPos.value.x);
  /** 当前正在进行的平移产生的地图Y坐标累加值 */
  const pendingPanY = computed(() => panCurrentPos.value.y - panStartPos.value.y);

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
  /** 计算两点间距离 */
  const getDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  /** 当前正在进行的缩放产生的比例累乘系数 */
  const pendingZoom = computed(() =>
    defaultTo(
      // 当前两触点的距离 比 初始两触点的距离
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
        ),
      1
    )
  );

  return {
    /** 获取内存中存储的指定校区的地图变换值 */
    getTransformValue,
    /** 是否正在平移 */
    isPanning,
    /** 是否正在缩放 */
    isZooming,
    /** 当前正在进行的平移开始时的触点坐标 */
    panStartPos,
    /** 当前正在进行的平移的触点坐标 */
    panCurrentPos,
    /** 当前正在进行的平移产生的地图X坐标累加值 */
    pendingPanX,
    /** 当前正在进行的平移产生的地图Y坐标累加值 */
    pendingPanY,
    /** 当前正在进行的缩放开始时的触点坐标 */
    zoomStartTouchPoints,
    /** 当前正在进行的缩放目前的触点坐标 */
    zoomCurrentTouchPoints,
    /** 当前正在进行的缩放产生的比例累乘系数 */
    pendingZoom
  };
});
