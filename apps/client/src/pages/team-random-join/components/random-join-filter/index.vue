<template>
  <section :class="styles.filterSection">
    <van-cell-group inset title="路线选择">
      <van-grid :border="false" :column-num="3" :class="styles.routeGrid">
        <van-grid-item v-for="route in props.routeOptions" :key="route.name">
          <van-button
            block
            round
            size="small"
            :type="route.name === routeName ? 'primary' : 'default'"
            :plain="route.name !== routeName"
            @click="handleRouteClick(route.name)"
          >
            <span :class="styles.routeName">{{ route.title }}</span>
            <span :class="styles.routeDistance">{{ Math.round(route.distanceKm) }}km</span>
          </van-button>
        </van-grid-item>
      </van-grid>
    </van-cell-group>
  </section>

  <section :class="styles.filterSection">
    <van-cell-group inset title="队伍选择">
      <van-radio-group v-model="teamFilter" direction="horizontal" :class="styles.teamFilterGroup">
        <van-radio
          v-for="filter in props.teamFilterOptions"
          :key="filter.value"
          :name="filter.value"
        >
          {{ filter.label }}
        </van-radio>
      </van-radio-group>
    </van-cell-group>
  </section>
</template>

<script setup lang="ts">
// eslint-disable-next-line import/no-duplicates
import type { RandomJoinRouteOption, RandomJoinTeamFilterOption } from "../../types";
// eslint-disable-next-line import/no-duplicates
import type { RouteName, TeamFilter } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  routeOptions: readonly RandomJoinRouteOption[];
  teamFilterOptions: readonly RandomJoinTeamFilterOption[];
}>();

const routeName = defineModel<RouteName>("routeName", { required: true });
const teamFilter = defineModel<TeamFilter>("teamFilter", { required: true });

const handleRouteClick = (value: RouteName) => {
  routeName.value = value;
};
</script>
