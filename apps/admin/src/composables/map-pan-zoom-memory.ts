import { isUndefined } from "lodash-es";
import { defineStore } from "pinia";
import { type Ref, ref, toRef } from "vue";

import type { CampusId } from "@/walk-config";

/** 地图的变化值 */
interface MapTransform {
  /** X平移 */
  x: number;
  /** Y平移 */
  y: number;
  /** 缩放比例 */
  scale: number;
}

const useMapPanZoomStore = defineStore("mapPanZoom", () => {
  /** 地图的变换值 */
  const transformMap = ref<Partial<Record<CampusId, MapTransform>>>({});
  return { transformMap };
});

/** 内存中记忆的地图变换值（reload时重置） */
export const useMapPanZoomMemory = (
  /** 校区ID */
  campusId: CampusId,
  /** 若内存中不存在此校区的变化值，则初始化为该参数的值 */
  initialTransform: MapTransform = {
    x: 0,
    y: 0,
    scale: 1
  }
) => {
  const mapPanZoomStore = useMapPanZoomStore();
  if (isUndefined(mapPanZoomStore.transformMap[campusId])) {
    mapPanZoomStore.transformMap[campusId] = initialTransform;
  }
  return { transform: toRef(mapPanZoomStore.transformMap, campusId) as Ref<MapTransform> };
};
