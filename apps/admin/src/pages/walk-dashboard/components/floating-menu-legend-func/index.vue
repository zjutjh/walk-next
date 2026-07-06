<!-- 图例功能 -->
<template>
  <div @click="handleFuncBtnClick">
    <slot />
  </div>
  <van-popup v-model:show="isLegendShow" :class="styles.popup" destroy-on-close closeable round>
    <van-cell :class="styles.cell" title="打卡点" size="large" center
      ><van-image
        :class="styles.legend"
        :src="CAMPUS_CONFIG[props.campusId].pointLegendUrl"
        fit="contain"
    /></van-cell>
    <van-cell
      v-for="route in CAMPUS_ROUTE_LIST_MAP[props.campusId]"
      :key="route"
      :class="styles.cell"
      :title="`${ROUTE_CONFIG[route].text}路线`"
      size="large"
      center
      ><van-image :class="styles.legend" :src="ROUTE_CONFIG[route].legendUrl" fit="contain"
        ><template #loading><van-loading size="0.25rem" /></template></van-image
    ></van-cell>
  </van-popup>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { CAMPUS_CONFIG, CAMPUS_ROUTE_LIST_MAP, type CampusId, ROUTE_CONFIG } from "@/walk-config";

import styles from "./index.module.scss";

export interface FloatingMenuLegendFuncProps {
  /** 校区ID */
  campusId: CampusId;
}

const props = defineProps<FloatingMenuLegendFuncProps>();

/** 是否展示图例弹窗 */
const isLegendShow = ref(false);

/** 插槽中的功能按钮被点击 */
const handleFuncBtnClick = () => {
  isLegendShow.value = true;
};
</script>
