<!-- 地图数据大盘页 -->
<template>
  <default-layout :title="`${WALK_ROUTE[props.campusId].name}数据大盘`">
    <team-search />
    <map-picker />
    <data-panel />
  </default-layout>
</template>

<script setup lang="ts">
import { WALK_ROUTE } from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";

import DataPanel from "./components/data-panel/index.vue";
import MapPicker from "./components/map-picker/index.vue";
import TeamSearch from "./components/team-search/index.vue";

const props = defineProps<{
  campusId: keyof typeof WALK_ROUTE;
}>();
</script>
