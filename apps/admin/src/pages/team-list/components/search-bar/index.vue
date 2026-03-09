<!-- 队伍搜索栏 -->
<template>
  <van-search
    ref="searchRef"
    v-model.trim="searchValue"
    :class="styles.component"
    :show-action="Boolean(searchValue.trim())"
    :placeholder="`搜索${TEAM_SEARCH_TYPE[searchType]?.text}`"
    clear-trigger="always"
    input-align="center"
    shape="round"
    @search="handleSearchApply"
    @update:model-value="handleInputValueChange"
    @focus="isSearchInputFocus = true"
    @blur="isSearchInputFocus = false"
  >
    <template #left>
      <van-dropdown-menu :class="styles.typeDropdownMenu">
        <van-dropdown-item
          v-model="searchType"
          :title="TEAM_SEARCH_TYPE[searchType]?.abbr"
          :options="TEAM_SEARCH_TYPE_OPTIONS"
        />
      </van-dropdown-menu>
    </template>
    <template #action>
      <div
        v-if="searchValue !== urlQuery.keyword || searchType !== urlQuery.searchType"
        :class="styles.searchBtn"
        @click="handleSearchApply"
      >
        搜索
      </div>
      <div v-else :class="styles.searchBtn" @click="handleSearchCancel">取消</div>
    </template>
  </van-search>
</template>

<script setup lang="ts">
import type { SearchInstance } from "vant";
import { ref, useTemplateRef, watch } from "vue";

import type { TeamListUrlQuery } from "../../types";
import { TEAM_SEARCH_TYPE, TEAM_SEARCH_TYPE_OPTIONS } from "../constants";
import styles from "./index.module.scss";

const urlQuery = defineModel<TeamListUrlQuery>("urlQuery", { required: true });

/** vant搜索框组件 */
const vantSearchComponent = useTemplateRef<SearchInstance>("searchRef");

/** 选中的搜索类型 */
const searchType = ref(urlQuery.value.searchType);
// 实际搜索值发生变化时，与实际搜索值同步
watch(
  () => urlQuery.value.searchType,
  (newValue) => {
    searchType.value = newValue;
  }
);

/** 搜索输入框的内容 */
const searchValue = ref(urlQuery.value.keyword);

/** 确定搜索 */
const handleSearchApply = () => {
  // 判空
  if (searchValue.value.length === 0) return;
  // 应用搜索
  urlQuery.value.searchType = searchType.value;
  urlQuery.value.keyword = searchValue.value;
};

/** 取消搜索 */
const handleSearchCancel = () => {
  // 取消搜索词
  urlQuery.value.keyword = "";
  // 清空搜索输入框
  searchValue.value = "";
};

/** 搜索输入框的内容变化 */
const handleInputValueChange = () => {
  /** 取消搜索词 */
  urlQuery.value.keyword = "";
};

/** 搜索框是否被聚焦 */
const isSearchInputFocus = ref(false);

defineExpose({
  /** vant搜索框组件 */
  vantSearchComponent,
  /** 搜索框是否被聚焦 */
  isSearchInputFocus
});
</script>
