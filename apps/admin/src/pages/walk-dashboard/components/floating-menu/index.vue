<!-- 悬浮菜单 -->
<template>
  <div :class="styles.component">
    <!-- 地图适应屏幕大小（回到cover尺寸）功能 -->
    <floating-menu-fit-to-screen-func
      :is-map-not-fit="props.isMapNotFit"
      :fit-to-screen-func="props.fitToScreenFunc"
    >
      <van-button :class="styles.btn" type="primary" round><mdi-fullscreen /></van-button>
    </floating-menu-fit-to-screen-func>

    <!-- 列表式点位/路线选择器功能 -->
    <floating-menu-list-picker-func v-model:url-query="urlQuery" :campus-id="props.campusId">
      <van-button :class="styles.btn" type="primary" round><ic-baseline-timeline /></van-button>
    </floating-menu-list-picker-func>

    <!-- 图例功能 -->
    <floating-menu-legend-func :campus-id="props.campusId">
      <van-button :class="styles.btn" type="primary" round><mdi-help /></van-button>
    </floating-menu-legend-func>
  </div>
</template>

<script setup lang="ts">
import IcBaselineTimeline from "~icons/ic/baseline-timeline";
import MdiFullscreen from "~icons/mdi/fullscreen";
import MdiHelp from "~icons/mdi/help";

import type { DashboardUrlQuery } from "../../types";
import FloatingMenuFitToScreenFunc, {
  type FloatingMenuFitScreenFuncProps
} from "../floating-menu-fit-screen-func/index.vue";
import FloatingMenuLegendFunc, {
  type FloatingMenuLegendFuncProps
} from "../floating-menu-legend-func/index.vue";
import FloatingMenuListPickerFunc, {
  type FloatingMenuListPickerFuncProps
} from "../floating-menu-list-picker-func/index.vue";
import styles from "./index.module.scss";

const props = defineProps<
  FloatingMenuLegendFuncProps & FloatingMenuFitScreenFuncProps & FloatingMenuListPickerFuncProps
>();

/** URL Query */
const urlQuery = defineModel<DashboardUrlQuery>("urlQuery", { required: true });
</script>
