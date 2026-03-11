<!-- 地图式点位/路线选择器 -->
<template>
  <div
    ref="componentRef"
    :class="styles.component"
    :style="{
      '--jh-walk-hot-rect-border-color': hotRectBorderColor
    }"
  >
    <!-- 地图 -->
    <van-image :class="styles.mapImage" :src="props.mapUrl" @load="handleImageLoad">
      <template #loading><van-loading size="0.5rem" /></template>
      <template #error
        ><van-empty image="error" image-size="1rem" description="地图加载失败，请刷新重试"
      /></template>
    </van-image>

    <!-- 行程段热区 -->
    <template v-for="segmentKey in CAMPUS_SEGMENT_LIST_MAP[props.campusId]" :key="segmentKey">
      <div
        v-for="(hotRectCss, index) in SEGMENT_CONFIG[segmentKey]?.hotRectList"
        :key="`${segmentKey}${index}`"
        :jh-walk-hot-rect-tip="SEGMENT_DERIVATIVE[segmentKey].text"
        :class="[styles.hotRect, urlQuery.segment === segmentKey ? styles.chosen : '']"
        :style="isEmpty(hotRectCss) ? hotRectDefaultStyle : hotRectCss"
        @click.stop="handleSegmentChosen(segmentKey)"
      ></div>
    </template>
    <!-- 点位热区 -->
    <template v-for="pointId in CAMPUS_POINT_LIST_MAP[props.campusId]" :key="pointId">
      <div
        v-for="(hotRectCss, index) in POINT_CONFIG[pointId].hotRectList"
        :key="`${pointId}${index}`"
        :jh-walk-hot-rect-tip="POINT_CONFIG[pointId].text"
        :class="[styles.hotRect, urlQuery.point === pointId ? styles.chosen : '']"
        :style="isEmpty(hotRectCss) ? hotRectDefaultStyle : hotRectCss"
        @click.stop="handlePointChosen(pointId)"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 *
 * 是否显示热区边界（调试预览用，仅在vite development模式生效，生产环境不会显示）
 *
 */
const DEBUG_SHOW_HOT_RECT_BORDER = false;

const hotRectBorderColor =
  import.meta.env.MODE === "development" && DEBUG_SHOW_HOT_RECT_BORDER ? "#000000" : undefined; // eslint-disable-line @typescript-eslint/no-unnecessary-condition

import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import { isEmpty, isNull } from "lodash-es";
import { type StyleValue, toRef, useTemplateRef } from "vue";

import {
  CAMPUS_POINT_LIST_MAP,
  CAMPUS_SEGMENT_LIST_MAP,
  type CampusId,
  POINT_CONFIG,
  type PointId,
  SEGMENT_CONFIG,
  SEGMENT_DERIVATIVE,
  type SegmentKey
} from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 地图图片的URL */
  mapUrl: string;
  /** 校区ID */
  campusId: CampusId;
}>();

const emit = defineEmits<{
  /** 通知父组件大小变化 */
  resize: [];
}>();

/** 组件元素 */
const componentRef = useTemplateRef("componentRef");

/** URL Query */
const urlQuery = defineModel<DashboardUrlQuery>("urlQuery", { required: true });

/** 为空的热区矩形样式对象提供的默认样式 */
const hotRectDefaultStyle: StyleValue = {
  left: "0%",
  top: "0%",
  width: "2%",
  height: "2%",
  transform: "rotateZ(0deg)"
};

/** 使图片cover组件 */
const coverImage = (imgDOM: HTMLImageElement) => {
  if (isNull(componentRef.value) || isNull(componentRef.value)) return;
  // 使“图片尺寸:组件尺寸”更小的边伸缩，填满组件，另一条边按比例自然变化
  if (
    imgDOM.naturalWidth / componentRef.value.clientWidth <
    imgDOM.naturalHeight / componentRef.value.clientHeight
  ) {
    imgDOM.style.width = "100%";
    imgDOM.style.height = "auto";
  } else {
    imgDOM.style.width = "auto";
    imgDOM.style.height = "100%";
  }
  // 使组件与图片大小一致
  componentRef.value.style.width = `${imgDOM.clientWidth}px`;
  componentRef.value.style.height = `${imgDOM.clientHeight}px`;
};

/** 图片加载完成 */
const handleImageLoad = (e: Event) => {
  if (!(e.target instanceof HTMLImageElement)) return;
  coverImage(e.target);
};

/** 组件DOM父元素大小发生变化 */
useResizeObserver(
  toRef(() => componentRef.value?.parentElement),
  useDebounceFn(() => {
    if (isNull(componentRef.value)) return;
    const imgDOM = componentRef.value.querySelector(`.${styles.mapImage} img`);
    if (!(imgDOM instanceof HTMLImageElement)) return;
    // 重置旧样式
    componentRef.value.style.width = "";
    componentRef.value.style.height = "";
    imgDOM.style.width = "";
    imgDOM.style.height = "";
    // 重新缩放图片
    coverImage(imgDOM);
    // 通知父组件
    emit("resize");
  }, 50)
);

/** 选择点位 */
const handlePointChosen = (pointId: PointId) => {
  urlQuery.value.segment = "";
  urlQuery.value.point = pointId;
};

/** 选择行程段 */
const handleSegmentChosen = (segmentKey: SegmentKey) => {
  urlQuery.value.point = "";
  urlQuery.value.segment = segmentKey;
};

defineExpose({
  /** 组件DOM */
  DOM: componentRef
});
</script>
