<!-- 支持平移与缩放的漫游地图容器 -->
<template>
  <div
    ref="viewport"
    :class="styles.component"
    :style="{
      '--jh-walk-pan-zoom-view-background': `url('${props.mapUrl}')`
    }"
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
    <floating-menu
      v-if="viewportRef"
      v-model:url-query="urlQuery"
      :campus-id="props.campusId"
      :is-map-not-fit="isMapNotFit"
      :fit-to-screen-func="fitToScreen"
      @click.stop
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue, toRef, useTemplateRef } from "vue";

import { useMapPanZoomStore } from "@/stores/map-pan-zoom-store";
import type { CampusId } from "@/walk-config";

import { useMapPanZoom } from "../../composables/map-pan-zoom";
import type { DashboardUrlQuery } from "../../types";
import FloatingMenu from "../floating-menu/index.vue";
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
/** 地图组件 */
const mapComponentRef = useTemplateRef("map");

/** URL Query */
const urlQuery = defineModel<DashboardUrlQuery>("urlQuery", { required: true });
/** 地图的变换状态 */
const mapPanZoomStore = useMapPanZoomStore();
/** 地图的变换值 */
const transformValue = mapPanZoomStore.getTransformValue(props.campusId);

// 为地图启用平移缩放功能
const { mapTransformLimits, applyMapPendingTransform, limitMapTranslate, limitMapScale } =
  useMapPanZoom({
    campusId: props.campusId,
    viewportElementRef: viewportRef,
    mapElementRef: toRef(() => mapComponentRef.value?.DOM)
  });

/** 地图的额外CSS样式 */
const mapTransformCss = computed<StyleValue>(() => ({
  /** 平移缩放变换 */
  transform: `translate(${transformValue.pending.value.x}px, ${transformValue.pending.value.y}px) scale(${transformValue.pending.value.scale})`
}));

/** 捕获到未被热区捕获的点击事件 */
const handleNotStoppedClick = () => {
  // 清除选中的点位与行程段
  urlQuery.value.point = "";
  urlQuery.value.segment = "";
};

/** 地图是否与视口不吻合 (地图与视口的高度不相同，宽度也不相同)*/
const isMapNotFit = computed(
  () =>
    Math.abs(transformValue.pending.value.scale - 1) > 0.005 &&
    Math.abs(transformValue.pending.value.scale - mapTransformLimits.scaleMin.value) > 0.005
);

/** 适应屏幕大小（回到cover尺寸） */
const fitToScreen = () => {
  applyMapPendingTransform();
  transformValue.base.value.scale = 1;
  // 缩放值变化可能会导致平移值超限，需要对平移值做限制
  limitMapTranslate();
};
</script>
