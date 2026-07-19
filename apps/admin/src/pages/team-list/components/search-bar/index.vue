<!-- 团队搜索栏 -->
<template>
  <van-search
    ref="searchRef"
    v-model.trim="searchValue"
    :class="styles.component"
    :show-action="Boolean(searchValue.trim() || urlQuery.keyword)"
    :placeholder="`搜索${TEAM_SEARCH_TYPE[urlQuery.searchType]?.text}`"
    clear-trigger="always"
    input-align="center"
    shape="round"
    @search="handleSearchApply"
    @update:model-value="handleInputValueChange"
    @focus="isSearchInputFocus = true"
    @blur="isSearchInputFocus = false"
  >
    <template #left>
      <!-- 搜索类型选择器 -->
      <van-dropdown-menu :class="styles.typeDropdownMenu">
        <van-dropdown-item
          v-model="urlQuery.searchType"
          :title="TEAM_SEARCH_TYPE[urlQuery.searchType]?.abbr"
          :options="TEAM_SEARCH_TYPE_OPTIONS"
        />
      </van-dropdown-menu>
    </template>
    <template #action>
      <!-- 输入框右侧按钮 -->
      <div
        v-if="searchValue !== urlQuery.keyword && searchValue.trim()"
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
import { ref, useTemplateRef } from "vue";

import type { TeamListUrlQuery } from "../../types";
import { TEAM_SEARCH_TYPE, TEAM_SEARCH_TYPE_OPTIONS } from "../constants";
import styles from "./index.module.scss";

const urlQuery = defineModel<TeamListUrlQuery>("urlQuery", { required: true });

/** vant搜索框组件 */
const vantSearchRef = useTemplateRef<SearchInstance>("searchRef");

/** 搜索输入框的内容 */
const searchValue = ref(urlQuery.value.keyword);

/** 确定搜索 */
const handleSearchApply = () => {
  // 判空
  if (searchValue.value.length === 0) return;
  // 应用搜索
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
const handleInputValueChange = (newValue: string) => {
  // 若内容不为空，取消搜索词
  if (newValue.trim()) {
    urlQuery.value.keyword = "";
  }
};

/** 搜索框是否被聚焦 */
const isSearchInputFocus = ref(false);

defineExpose({
  /** vant搜索框组件 */
  vantSearchRef,
  /** 搜索框是否被聚焦 */
  isSearchInputFocus
});
</script>
