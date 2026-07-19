import { useElementSize, useEventListener, useThrottleFn } from "@vueuse/core";
import { clamp, cloneDeep } from "lodash-es";
import { computed, type ShallowRef } from "vue";

import { useMapPanZoomStore } from "@/pages/walk-dashboard/composables/map-pan-zoom-store";
import type { CampusId } from "@/walk-config";

import { useMapPanZoomState } from "./map-pan-zoom-state";

/** 为地图启用平移缩放功能 */
export const useMapPanZoom = ({
  campusId,
  viewportElementRef,
  mapElementRef
}: {
  campusId: CampusId;
  viewportElementRef: Readonly<ShallowRef<HTMLDivElement | null | undefined>>;
  mapElementRef: Readonly<ShallowRef<HTMLDivElement | null | undefined>>;
}) => {
  const mapPanZoomStore = useMapPanZoomStore();
  // 校区对应地图的变换值
  const { transformValue } = useMapPanZoomState(campusId);

  /** 视口元素的尺寸 */
  const viewSize = useElementSize(viewportElementRef, undefined, { box: "border-box" });
  /** 地图容器元素的无缩放宽度（地图容器元素与地图尺寸一致） */
  const mapOriginalSize = useElementSize(mapElementRef, undefined, { box: "border-box" });

  // 避免使用boundingRect获取渲染尺寸，因为它在重绘之后才更新

  /** 地图的渲染宽度 */
  const mapWidth = computed(() => mapOriginalSize.width.value * transformValue.pending.value.scale);
  /** 地图的渲染高度 */
  const mapHeight = computed(
    () => mapOriginalSize.height.value * transformValue.pending.value.scale
  );

  /** 地图变换值限制：
   * 当前缩放比例下，地图的可见区域必须最大，即 地图的横/纵轴投影 与 视口的横/纵轴投影 中的长者必须覆盖短者 */
  const limits = {
    /** translateX下界 */
    translateXMin: computed(() =>
      viewSize.width.value < mapWidth.value
        ? viewSize.width.value - mapWidth.value - (mapOriginalSize.width.value - mapWidth.value) / 2
        : -(mapOriginalSize.width.value - mapWidth.value) / 2
    ),
    /** translateX上界 */
    translateXMax: computed(() =>
      viewSize.width.value > mapWidth.value
        ? viewSize.width.value - mapWidth.value - (mapOriginalSize.width.value - mapWidth.value) / 2
        : -(mapOriginalSize.width.value - mapWidth.value) / 2
    ),
    /** translateY下界 */
    translateYMin: computed(() =>
      viewSize.height.value < mapHeight.value
        ? viewSize.height.value -
          mapHeight.value -
          (mapOriginalSize.height.value - mapHeight.value) / 2
        : -(mapOriginalSize.height.value - mapHeight.value) / 2
    ),
    /** translateY上界 */
    translateYMax: computed(() =>
      viewSize.height.value > mapHeight.value
        ? viewSize.height.value -
          mapHeight.value -
          (mapOriginalSize.height.value - mapHeight.value) / 2
        : -(mapOriginalSize.height.value - mapHeight.value) / 2
    ),
    /** scale下界 */
    scaleMin: computed(() =>
      Math.min(
        viewSize.width.value / mapOriginalSize.width.value,
        viewSize.height.value / mapOriginalSize.height.value
      )
    ),
    /** scale上界 */
    scaleMax: computed(() => 5)
  };

  /** 使地图的平移值满足限制 */
  const limitTranslate = () => {
    // X平移
    if (
      transformValue.pending.value.x < limits.translateXMin.value ||
      transformValue.pending.value.x > limits.translateXMax.value
    ) {
      // X平移值超限，重置漫游并约束变换值
      applyPendingTransform();
      transformValue.base.value.x = clamp(
        transformValue.base.value.x,
        limits.translateXMin.value,
        limits.translateXMax.value
      );
    }
    // Y平移
    if (
      transformValue.pending.value.y < limits.translateYMin.value ||
      transformValue.pending.value.y > limits.translateYMax.value
    ) {
      // Y平移值超限，重置漫游并约束变换值
      applyPendingTransform();
      transformValue.base.value.y = clamp(
        transformValue.base.value.y,
        limits.translateYMin.value,
        limits.translateYMax.value
      );
    }
  };
  /** 使地图的缩放值满足限制 */
  const limitScale = () => {
    if (
      transformValue.pending.value.scale < limits.scaleMin.value ||
      transformValue.pending.value.scale > limits.scaleMax.value
    ) {
      // 缩放值超限，重置漫游并约束变换值
      applyPendingTransform();
      transformValue.base.value.scale = clamp(
        transformValue.base.value.scale,
        limits.scaleMin.value,
        limits.scaleMax.value
      );
    }
    // 缩放值变化可能会导致平移值超限，需要对平移值也做检查
    limitTranslate();
  };

  /** 应用当前正在进行的漫游产生的变换，然后重置漫游 */
  const applyPendingTransform = () => {
    transformValue.base.value = cloneDeep(transformValue.pending.value);
    // 将起始触点设置为终止触点，以重置漫游
    mapPanZoomStore.panStartPos = cloneDeep(mapPanZoomStore.panCurrentPos);
    mapPanZoomStore.zoomStartTouchPoints = cloneDeep(mapPanZoomStore.zoomCurrentTouchPoints);
  };

  /** 触摸开始 */
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      if (!e.touches[0]) return;
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      if (!e.touches[0] || !e.touches[1]) return;
      handleZoomStart(
        e.touches[0].clientX,
        e.touches[0].clientY,
        e.touches[1].clientX,
        e.touches[1].clientY
      );
    }
  };
  /** 触摸点移动 */
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      if (!e.touches[0]) return;
      handlePan(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      if (!e.touches[0] || !e.touches[1]) return;
      handleZoomChange(
        e.touches[0].clientX,
        e.touches[0].clientY,
        e.touches[1].clientX,
        e.touches[1].clientY
      );
    }
  };

  /** 平移开始 */
  const handlePanStart = (x: number, y: number) => {
    mapPanZoomStore.isPanning = true;
    mapPanZoomStore.panStartPos = { x, y };
    // 当前触点同步为初始触点
    mapPanZoomStore.panCurrentPos = { ...mapPanZoomStore.panStartPos };
  };
  /** 平移 */
  const handlePan = useThrottleFn((x: number, y: number) => {
    if (!mapPanZoomStore.isPanning) return;
    mapPanZoomStore.panCurrentPos.x = x;
    mapPanZoomStore.panCurrentPos.y = y;
    limitTranslate();
  }, 10);
  /** 鼠标拖拽平移 */
  const handleMouseDragPan = (e: MouseEvent) => {
    if (!mapPanZoomStore.isPanning) return;
    e.preventDefault();
    handlePan(e.clientX, e.clientY);
  };

  /** 缩放开始 */
  const handleZoomStart = (x1: number, y1: number, x2: number, y2: number) => {
    mapPanZoomStore.isZooming = true;
    mapPanZoomStore.zoomStartTouchPoints = { x1, y1, x2, y2 };
    // 当前触点同步为初始触点
    mapPanZoomStore.zoomCurrentTouchPoints = { ...mapPanZoomStore.zoomStartTouchPoints };
  };
  /** 缩放 */
  const handleZoomChange = useThrottleFn((x1: number, y1: number, x2: number, y2: number) => {
    if (!mapPanZoomStore.isZooming) return;
    mapPanZoomStore.zoomCurrentTouchPoints.x1 = x1;
    mapPanZoomStore.zoomCurrentTouchPoints.y1 = y1;
    mapPanZoomStore.zoomCurrentTouchPoints.x2 = x2;
    mapPanZoomStore.zoomCurrentTouchPoints.y2 = y2;
    limitScale();
  }, 20);
  /** 鼠标滚轮缩放 */
  const handleMouseWheelZoom = (e: WheelEvent) => {
    e.preventDefault();
    if (mapPanZoomStore.isPanning) return;
    transformValue.base.value.scale *= clamp(1 - e.deltaY / 600, 0.5, 1.5);
    limitScale();
  };

  /** 鼠标或触摸点抬起 */
  const handlePointerUp = (e: MouseEvent | TouchEvent) => {
    applyPendingTransform();
    mapPanZoomStore.isPanning = false;
    mapPanZoomStore.isZooming = false;
    if (e instanceof TouchEvent && e.touches.length !== 0) {
      handleTouchStart(e);
    }
  };

  useEventListener(viewportElementRef, "touchstart", handleTouchStart);
  useEventListener(viewportElementRef, "touchmove", handleTouchMove, { passive: false });
  useEventListener(viewportElementRef, ["touchcancel", "touchend"], handlePointerUp);
  useEventListener(viewportElementRef, "mousedown", (e) => handlePanStart(e.clientX, e.clientY));
  useEventListener(viewportElementRef, "mouseup", handlePointerUp);
  useEventListener(viewportElementRef, "wheel", handleMouseWheelZoom, { passive: false });
  useEventListener(window, "mousemove", handleMouseDragPan, { passive: false });
  useEventListener(window, ["mouseup", "blur"], handlePointerUp);

  return {
    mapTransformLimits: limits,
    applyMapPendingTransform: applyPendingTransform,
    limitMapTranslate: limitTranslate,
    limitMapScale: limitScale
  };
};
