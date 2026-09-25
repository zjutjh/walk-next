<template>
  <div :class="styles.routeFilter">
    <p :class="styles.filterTitle">{{ t("路线选择") }}</p>

    <div :class="styles.routeButtons">
      <van-button
        v-for="route in props.routeOptions"
        :key="route.name"
        size="small"
        :type="route.name === routeName ? 'primary' : 'default'"
        @click="routeName = route.name"
      >
        <span :class="styles.routeName">{{ t(route.title) }}</span>
        <span :class="styles.routeDistance">{{ route.distanceKm }}km</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { RandomJoinRouteOption, RouteName } from "../../types";
import styles from "./index.module.scss";

const { t } = useI18n();

const props = defineProps<{
  routeOptions: readonly RandomJoinRouteOption[];
}>();

const routeName = defineModel<RouteName>("routeName", { required: true });
</script>
