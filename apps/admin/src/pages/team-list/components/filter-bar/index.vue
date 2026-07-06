<!-- 筛选器 -->
<template>
  <div :class="styles.component">
    <!-- 行程段筛选 -->
    <van-checkbox :model-value="urlQuery.segment !== ''" @click="handleSegmentFilterOpen()">
      <template #icon
        ><div :class="styles.filterItem">
          <div :class="styles.filterText">
            {{ urlQuery.segment !== "" ? SEGMENT_DERIVATIVE[urlQuery.segment]?.text : "路段" }}
          </div>
          <!-- 解除行程段筛选的按钮 --><van-icon
            class="van-haptics-feedback"
            :class="styles.clearFilterBtn"
            name="cross"
            size="0.15rem"
            @click.stop="handleSegmentFilterClear"
          /></div
      ></template>
    </van-checkbox>
    <!-- 弹出的行程段选择器 -->
    <van-popup v-model:show="isSegmentPickerVisible" position="bottom" destroy-on-close>
      <van-picker
        v-model="segment"
        :columns="columns"
        :readonly="!isSegmentPickerVisible"
        :visible-option-num="8"
        title="选择路段"
        @confirm="handleSegmentPickerConfirm"
        @cancel="handleSegmentPickerCancel"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import type { SetRequired } from "type-fest";
import type { PickerOption } from "vant";
import { computed, ref, watch } from "vue";

import {
  CAMPUS_SEGMENT_LIST_MAP,
  type CampusId,
  SEGMENT_DERIVATIVE,
  type SegmentKey
} from "@/walk-config";

import type { TeamListUrlQuery } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
}>();

const urlQuery = defineModel<TeamListUrlQuery>("urlQuery", { required: true });

/** 选择器选择的行程段key 类型是数组 因为vant选择器组件只接受数组 */
const segment = ref<[SegmentKey | ""]>([urlQuery.value.segment]);
// 实际搜索值变化时同步状态
watch(
  () => urlQuery.value.segment,
  (newValue) => {
    segment.value = [newValue];
  }
);

/** 行程段选择器的选项 */
const columns = computed<Array<SetRequired<PickerOption, "text" | "value">>>(() =>
  [{ text: "全部路段", value: "" }].concat(
    CAMPUS_SEGMENT_LIST_MAP[props.campusId].map((segmentKey) => ({
      /** 行程段名 */
      text: SEGMENT_DERIVATIVE[segmentKey].text,
      /** 行程段key */
      value: segmentKey
    }))
  )
);

/** 是否显示行程段选择器 */
const isSegmentPickerVisible = ref(false);

/** 行程段选择器确认 */
const handleSegmentPickerConfirm = () => {
  // 隐藏弹出层
  isSegmentPickerVisible.value = false;
  // 应用筛选的行程段
  urlQuery.value.segment = segment.value[0];
};

/** 行程段选择器取消 */
const handleSegmentPickerCancel = () => {
  // 隐藏弹出层
  isSegmentPickerVisible.value = false;
};

/** 打开行程段筛选器 */
const handleSegmentFilterOpen = () => {
  // 与实际搜索值同步
  segment.value = [urlQuery.value.segment];
  // 显示弹出层
  isSegmentPickerVisible.value = true;
};

/** 解除行程段筛选 */
const handleSegmentFilterClear = () => {
  urlQuery.value.segment = "";
};

defineExpose({
  /** 打开行程段筛选器 */
  openSegmentFilter: handleSegmentFilterOpen
});
</script>
