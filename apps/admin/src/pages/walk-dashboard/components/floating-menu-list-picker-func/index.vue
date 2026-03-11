<!-- 列表式点位/路线选择器功能 -->
<template>
  <div @click="handleFuncBtnClick">
    <slot />
  </div>
  <van-popup
    v-model:show="isListPickerShow"
    :class="styles.popup"
    position="bottom"
    destroy-on-close
  >
    <van-tree-select
      v-model:main-active-index="routeIndex"
      :class="styles.treeSelect"
      :items="items"
      height=""
      @click-item="handleItemClick"
    />
  </van-popup>
</template>

<script setup lang="ts">
import type { Merge } from "type-fest";
import type { TreeSelectChild, TreeSelectItem } from "vant";
import { computed, ref } from "vue";

import {
  CAMPUS_ROUTE_LIST_MAP,
  type CampusId,
  POINT_CONFIG,
  ROUTE_CONFIG,
  ROUTE_POINT_LIST_MAP,
  ROUTE_SEGMENT_LIST_MAP,
  SEGMENT_DERIVATIVE
} from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import styles from "./index.module.scss";

export interface FloatingMenuListPickerFuncProps {
  /** 校区ID */
  campusId: CampusId;
}

const props = defineProps<FloatingMenuListPickerFuncProps>();

/** URL Query */
const urlQuery = defineModel<DashboardUrlQuery>("urlQuery", { required: true });

/** 是否显示列表式选择器 */
const isListPickerShow = ref(false);

/** 列表式选择器的选择项 */
type ListPickerTreeSelectChild = Merge<
  TreeSelectChild,
  | {
      type: "point";
      id: DashboardUrlQuery["point"];
    }
  | {
      type: "segment";
      id: DashboardUrlQuery["segment"];
    }
>;

/** 列表式选择器的树结构 */
const items = computed<Array<TreeSelectItem>>(() =>
  CAMPUS_ROUTE_LIST_MAP[props.campusId].map((routeId) => ({
    /** 路线名 */
    text: ROUTE_CONFIG[routeId].text,
    /** 路线中的点位和行程段 */
    children:
      // 拼接路线的起点
      [
        {
          type: "point",
          text: POINT_CONFIG[ROUTE_POINT_LIST_MAP[routeId][0]].text,
          id: ROUTE_POINT_LIST_MAP[routeId][0]
        } as ListPickerTreeSelectChild
      ].concat(
        // 遍历路线的所有行程段
        ROUTE_SEGMENT_LIST_MAP[routeId].flatMap((segmentKey): ListPickerTreeSelectChild[] => [
          // 行程段
          {
            type: "segment",
            text: SEGMENT_DERIVATIVE[segmentKey].text,
            id: segmentKey
          },
          // 行程段的末点
          {
            type: "point",
            text: POINT_CONFIG[SEGMENT_DERIVATIVE[segmentKey].to].text,
            id: SEGMENT_DERIVATIVE[segmentKey].to
          }
        ])
      )
  }))
);

/** 选中的路线的索引 */
const routeIndex = ref(0);

/** 插槽中的功能按钮被点击 */
const handleFuncBtnClick = () => {
  // 显示弹出层
  isListPickerShow.value = true;
};

/** 选择点位或行程段 */
const handleItemClick = (item: ListPickerTreeSelectChild) => {
  // 关闭弹出层
  isListPickerShow.value = false;
  // 清空URL Query选择状态
  urlQuery.value.point = "";
  urlQuery.value.segment = "";
  // 设置URL Query选择状态
  switch (item.type) {
    case "point":
      urlQuery.value.point = item.id;
      break;
    case "segment":
      urlQuery.value.segment = item.id;
      break;
  }
};
</script>
