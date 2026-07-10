<!-- 搜索团队页 -->
<template>
  <default-layout :title="`${CAMPUS_CONFIG[campusId]?.text ?? ''}搜索团队`">
    <template #header>
      <search-bar ref="searchBarRef" v-model:url-query="urlQuery" />
      <filter-bar
        v-if="campusId"
        ref="filterBarRef"
        v-model:url-query="urlQuery"
        :campus-id="campusId"
      />
    </template>
    <template v-if="campusId">
      <result-list
        v-if="isQueryEnabled"
        :campus-id="campusId"
        :url-query="urlQuery"
        :is-query-enabled="isQueryEnabled"
      />
      <suggestion-empty
        v-else-if="filterBarComponent && searchBarComponent"
        v-model:url-query="urlQuery"
        :is-search-input-focus="searchBarComponent?.isSearchInputFocus"
        :search-instance="searchBarComponent?.vantSearchComponent"
        :open-segment-filter="filterBarComponent?.openSegmentFilter"
      />
    </template>
    <error-empty v-else :error="`校区不存在：${props.campusIdParam}`" />
    <team-details v-model:team-id="urlQuery.viewingTeam" />
  </default-layout>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue";

import { useStoredUrlQuery } from "@/composables";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CAMPUS_CONFIG, type CampusId } from "@/walk-config";

import FilterBar from "./components/filter-bar/index.vue";
import ResultList from "./components/result-list/index.vue";
import SearchBar from "./components/search-bar/index.vue";
import SuggestionEmpty from "./components/suggestion-empty/index.vue";
import TeamDetails from "./components/team-details/index.vue";
import type { TeamListUrlQuery } from "./types";

const props = defineProps<{
  /** Path Param传入的校区ID */
  campusIdParam: string;
}>();
/** 校区ID */
const campusId = computed(() => {
  if (Object.hasOwn(CAMPUS_CONFIG, props.campusIdParam)) {
    return props.campusIdParam as CampusId;
  }
  return "";
});

const { urlQuery } = useStoredUrlQuery<TeamListUrlQuery>({
  initialValue: {
    keyword: "",
    searchType: "captain_phone",
    segment: "",
    viewingTeam: ""
  }
});

/** 搜索栏组件 */
const searchBarComponent = useTemplateRef("searchBarRef");

/** 筛选栏组件 */
const filterBarComponent = useTemplateRef("filterBarRef");

/** 是否可以拉取数据 */
const isQueryEnabled = computed(
  () => urlQuery.value.segment !== "" || urlQuery.value.keyword !== ""
);
</script>
