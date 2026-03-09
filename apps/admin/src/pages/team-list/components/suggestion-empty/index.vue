<!-- 搜索建议面板 -->
<template>
  <div :class="styles.component">
    <div v-if="props.isSearchInputFocus" :class="styles.textTip">请输入搜索内容</div>
    <template v-else>
      <div :class="styles.textTip">猜你想搜</div>
      <van-grid :column-num="2" :border="false" gutter="0.5rem" icon-size="0.5rem" square clickable>
        <van-grid-item
          v-for="(type, typeValue) in TEAM_SEARCH_TYPE"
          :key="type.text"
          :class="styles.gridBtn"
          :icon="type.icon"
          :text="type.text"
          @click="handleSearchTypeClick(typeValue)"
        />
        <van-grid-item
          :class="styles.gridBtn"
          text="路段队伍列表"
          icon="filter-o"
          @click="props.openSegmentFilter"
        />
      </van-grid>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SearchType } from "api/types/admin";
import type { SearchInstance } from "vant";

import type { TeamListUrlQuery } from "../../types";
import { TEAM_SEARCH_TYPE } from "../constants";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 搜索框实例 */
  searchInstance: SearchInstance | null | undefined;
  /** 搜索框是否被聚焦 */
  isSearchInputFocus: boolean;
  /** 打开行程段筛选器的函数 */
  openSegmentFilter: () => void;
}>();

const urlQuery = defineModel<TeamListUrlQuery>("urlQuery", { required: true });

/** 点击类型进行切换 */
const handleSearchTypeClick = (typeValue: SearchType) => {
  // 变更搜索类型
  urlQuery.value.searchType = typeValue;
  // 聚焦输入框
  props.searchInstance?.focus();
};
</script>
