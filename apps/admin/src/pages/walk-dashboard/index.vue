<!-- 数据仪表盘页 -->
<template>
  <default-layout
    :class="styles.layout"
    :title="`${CAMPUS_CONFIG[props.campusId]?.text}数据大盘`"
    :scroll="false"
  >
    <template #right>
      <van-icon name="search" size="22" @click="handleSearchClick" />
    </template>
    <div :class="styles.topArea">
      <pan-zoom-map-view
        ref="panZoomMapViewRef"
        v-model:url-query="urlQuery"
        :campus-id="props.campusId"
        :map-url="CAMPUS_CONFIG[props.campusId]?.mapUrl"
      />
      <floating-menu
        v-if="panZoomMapViewRef"
        v-model:url-query="urlQuery"
        :campus-id="props.campusId"
        :is-map-not-fit="panZoomMapViewRef.isMapNotFit"
        :fit-to-screen-func="panZoomMapViewRef.fitToScreen"
      />
    </div>
    <data-overview :class="styles.dataPanel" :url-query="urlQuery" :campus-id="props.campusId" />
    <!-- 展示点位或行程段详情的浮动面板 -->
    <van-floating-panel
      v-model:height="floatingPanelHeight"
      :class="styles.floatingPanel"
      :anchors="floatingPanelAnchors"
    >
      <point-details
        v-if="urlQuery.point !== ''"
        v-model:point="urlQuery.point"
        :campus-id="props.campusId"
      />
      <segment-details
        v-else-if="urlQuery.segment !== ''"
        v-model:segment="urlQuery.segment"
        :campus-id="props.campusId"
      />
    </van-floating-panel>
  </default-layout>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import { computed, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";

import { useStoredUrlQuery } from "@/composables";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { pxToSize } from "@/utils";
import { CAMPUS_CONFIG, type CampusId } from "@/walk-config";

import DataOverview from "./components/data-overview/index.vue";
import FloatingMenu from "./components/floating-menu/index.vue";
import PanZoomMapView from "./components/pan-zoom-map-view/index.vue";
import PointDetails from "./components/point-details/index.vue";
import SegmentDetails from "./components/segment-details/index.vue";
import styles from "./index.module.scss";
import type { DashboardUrlQuery } from "./types";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
}>();

/** 漫游地图容器 */
const panZoomMapViewRef = useTemplateRef("panZoomMapViewRef");

const router = useRouter();

const { urlQuery } = useStoredUrlQuery<DashboardUrlQuery>({
  initialValue: {
    point: "",
    segment: ""
  },
  persist: "memory"
});

/** 浮动面板锚点位置 */
const floatingPanelAnchors = ref<number[]>([]);
// 根据视口宽度计算锚点位置
const { width } = useWindowSize();
watch(
  width,
  () => {
    // 关闭位置不能恰好为0，需留余量，因为浮动面板有向外阴影
    floatingPanelAnchors.value = [-pxToSize(10), pxToSize(240)];
  },
  { immediate: true }
);

/** 浮动面板高度 */
const floatingPanelHeight = computed({
  get: () =>
    // 选中点位或行程段时弹出，否则关闭
    urlQuery.value.segment !== "" || urlQuery.value.point !== ""
      ? floatingPanelAnchors.value.at(1)
      : floatingPanelAnchors.value.at(0),
  set: (newHeight) => {
    // 手动关闭浮动面板时清空选中项
    if (newHeight === floatingPanelAnchors.value.at(0)) {
      urlQuery.value.segment = "";
      urlQuery.value.point = "";
    }
  }
});

/** 前往搜索页 */
const handleSearchClick = () => {
  router.push(`/team-list/${props.campusId}`);
};
</script>
