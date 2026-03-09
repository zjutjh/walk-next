<!-- 支持平移与缩放的漫游地图容器 -->
<template>
  <div
    ref="viewport"
    :class="styles.component"
    :style="{
      '--jh-walk-pan-zoom-view-background': `url('${props.mapUrl}')`
    }"
    @mousedown="(e) => handlePanStart(e.clientX, e.clientY)"
    @mousemove.prevent="(e) => handlePan(e.clientX, e.clientY)"
    @mouseup="handleTouchEnd"
    @mouseleave="handleTouchEnd"
    @touchstart="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
    @wheel.prevent="handleMouseWheelZoom"
    @click="handleNotStoppedClick"
    @contextmenu.prevent
  >
    <map-picker
      ref="map"
      v-model:url-query="urlQuery"
      :class="styles.map"
      :style="mapTransformCss"
      :campus-id="props.campusId"
      :map-url="props.mapUrl"
      @resize="limitMapScale"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementSize, useThrottleFn } from "@vueuse/core";
import { clamp, defaultTo, round } from "lodash-es";
import { computed, ref, type StyleValue, toRef, useTemplateRef } from "vue";

import { useMapPanZoomMemory } from "@/composables/map-pan-zoom-memory";
import type { CampusId } from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import MapPicker from "../map-picker/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 地图图片的URL */
  mapUrl: string;
  /** 校区ID */
  campusId: CampusId;
}>();

/** 视口元素 */
const viewportRef = useTemplateRef("viewport");
/** 视口元素的宽度 */
const viewSize = useElementSize(viewportRef, undefined, { box: "border-box" });

/** 地图组件 */
const mapComponentRef = useTemplateRef("map");
/** 地图容器元素的无缩放宽度（地图容器元素与地图尺寸一致） */
const mapOriginalSize = useElementSize(
  toRef(() => mapComponentRef.value?.DOM),
  undefined,
  { box: "border-box" }
);

/** 地图预计的渲染宽度 */
const mapWidth = computed(() => mapOriginalSize.width.value * transformValue.value.scale);
/** 地图预计的渲染高度 */
const mapHeight = computed(() => mapOriginalSize.height.value * transformValue.value.scale);

/** URL Query */
const urlQuery = defineModel<DashboardUrlQuery>("urlQuery", { required: true });

/** 捕获到点击事件，清除选中的点位与行程段 */
const handleNotStoppedClick = () => {
  urlQuery.value.point = "";
  urlQuery.value.segment = "";
};

// （当前正在进行的漫游开始前）地图的变换值
const { transform: transformBase } = useMapPanZoomMemory(props.campusId);
/** 地图的实时变换值 */
const transformValue = computed(() => ({
  x: round(transformBase.value.x + pendingPanX.value, 1),
  y: round(transformBase.value.y + pendingPanY.value, 1),
  scale: transformBase.value.scale * pendingZoom.value
}));
/** 地图的CSS变换属性 */
const mapTransformCss = computed<StyleValue>(() => ({
  transform: `translate(${transformValue.value.x}px, ${transformValue.value.y}px) scale(${transformValue.value.scale})`
}));

/** 是否正在平移 */
const isPanning = ref(false);

/** 是否正在缩放 */
const isScaling = ref(false);

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

/** 当前正在进行的平移开始时的触点坐标（相对于组件） */
const panStartPos = ref({
  x: 0,
  y: 0
});
/** 平移开始 */
const handlePanStart = (x: number, y: number) => {
  isPanning.value = true;
  panStartPos.value = { x, y };
  // 当前触点同步为初始触点
  panCurrentPos.value = { ...panStartPos.value };
};
/** 当前正在进行的平移的触点坐标（相对于组件） */
const panCurrentPos = ref({
  x: 0,
  y: 0
});
/** 平移 */
const handlePan = useThrottleFn((x: number, y: number) => {
  if (!isPanning.value) return;
  panCurrentPos.value.x = x;
  panCurrentPos.value.y = y;
  limitMapTranslate();
}, 10);
/** 当前正在进行的平移产生的地图X坐标累加值 */
const pendingPanX = computed(() => panCurrentPos.value.x - panStartPos.value.x);
/** 当前正在进行的平移产生的地图Y坐标累加值 */
const pendingPanY = computed(() => panCurrentPos.value.y - panStartPos.value.y);

/** 当前正在进行的缩放开始时的触点坐标（相对于组件） */
const zoomStartTouchPoints = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
});
/** 缩放开始 */
const handleZoomStart = (x1: number, y1: number, x2: number, y2: number) => {
  isScaling.value = true;
  zoomStartTouchPoints.value = { x1, y1, x2, y2 };
  // 当前触点同步为初始触点
  zoomCurrentTouchPoints.value = { ...zoomStartTouchPoints.value };
};

/** 当前正在进行的缩放目前的触点坐标（相对于组件） */
const zoomCurrentTouchPoints = ref({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0
});
/** 缩放 */
const handleZoomChange = useThrottleFn((x1: number, y1: number, x2: number, y2: number) => {
  if (!isScaling.value) return;
  zoomCurrentTouchPoints.value.x1 = x1;
  zoomCurrentTouchPoints.value.y1 = y1;
  zoomCurrentTouchPoints.value.x2 = x2;
  zoomCurrentTouchPoints.value.y2 = y2;
  limitMapScale();
}, 20);
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

/** 应用当前正在进行的漫游产生的变换，然后重置漫游 */
const applyPendingTransform = () => {
  transformBase.value.x += pendingPanX.value;
  transformBase.value.y += pendingPanY.value;
  transformBase.value.scale *= pendingZoom.value;
  // 将初始触点设置为当前触点以重置漫游
  panStartPos.value = { ...panCurrentPos.value };
  zoomStartTouchPoints.value = { ...zoomCurrentTouchPoints.value };
};

/** 停止触摸 */
const handleTouchEnd = () => {
  applyPendingTransform();
  isPanning.value = false;
  isScaling.value = false;
};

/** 鼠标滚轮缩放 */
const handleMouseWheelZoom = (e: WheelEvent) => {
  transformBase.value.scale *= clamp(1 - e.deltaY / 600, 0.5, 1.5);
  limitMapScale();
};

/** 地图的变换值的限制
 * 当前缩放比例下，限制地图的可见区域必须最大，即 地图的横/纵轴投影 与 视口的横/纵轴投影 中的长者必须覆盖短者 */
const getTransformLimit = {
  /** transformX下界 */
  xMin: () =>
    viewSize.width.value < mapWidth.value
      ? viewSize.width.value - mapWidth.value - (mapOriginalSize.width.value - mapWidth.value) / 2
      : -(mapOriginalSize.width.value - mapWidth.value) / 2,
  /** transformX上界 */
  xMax: () =>
    viewSize.width.value > mapWidth.value
      ? viewSize.width.value - mapWidth.value - (mapOriginalSize.width.value - mapWidth.value) / 2
      : -(mapOriginalSize.width.value - mapWidth.value) / 2,
  /** transformY下界 */
  yMin: () =>
    viewSize.height.value < mapHeight.value
      ? viewSize.height.value -
        mapHeight.value -
        (mapOriginalSize.height.value - mapHeight.value) / 2
      : -(mapOriginalSize.height.value - mapHeight.value) / 2,
  /** transformY上界 */
  yMax: () =>
    viewSize.height.value > mapHeight.value
      ? viewSize.height.value -
        mapHeight.value -
        (mapOriginalSize.height.value - mapHeight.value) / 2
      : -(mapOriginalSize.height.value - mapHeight.value) / 2,
  /** scale下界 */
  scaleMin: () =>
    Math.min(
      viewSize.width.value / mapOriginalSize.width.value,
      viewSize.height.value / mapOriginalSize.height.value
    ),
  /** scale上界 */
  scaleMax: () => 5
};

/** 使地图的平移值满足限制 */
const limitMapTranslate = () => {
  // X平移
  const xMin = getTransformLimit.xMin();
  const xMax = getTransformLimit.xMax();
  if (transformValue.value.x < xMin || transformValue.value.x > xMax) {
    // 缩放值超限，重置漫游并约束变换值
    applyPendingTransform();
    transformBase.value.x = clamp(transformBase.value.x, xMin, xMax);
  }
  // Y平移
  const yMin = getTransformLimit.yMin();
  const yMax = getTransformLimit.yMax();
  if (transformValue.value.y < yMin || transformValue.value.y > yMax) {
    // 缩放值超限，重置漫游并约束变换值
    applyPendingTransform();
    transformBase.value.y = clamp(transformBase.value.y, yMin, yMax);
  }
};

/** 使地图的缩放值满足限制 */
const limitMapScale = () => {
  const scaleMin = getTransformLimit.scaleMin();
  const scaleMax = getTransformLimit.scaleMax();
  if (transformValue.value.scale < scaleMin || transformValue.value.scale > scaleMax) {
    // 缩放值超限，重置漫游并约束变换值
    applyPendingTransform();
    transformBase.value.scale = clamp(transformBase.value.scale, scaleMin, scaleMax);
  }
  // 缩放值变化可能会导致平移值超限，需要对平移值也做检查
  limitMapTranslate();
};

/** 地图是否与视口不吻合 (地图与视口的高度不相同，宽度也不相同)*/
const isMapNotFit = computed(
  () =>
    Math.abs(transformValue.value.scale - 1) > 0.005 &&
    Math.abs(transformValue.value.scale - getTransformLimit.scaleMin()) > 0.005
);

/** 适应屏幕大小（回到cover尺寸） */
const fitToScreen = () => {
  applyPendingTransform();
  transformBase.value.scale = 1;
  // 缩放值变化可能会导致平移值超限，需要对平移值做检查
  limitMapTranslate();
};

defineExpose({
  fitToScreen,
  isMapNotFit
});
</script>
