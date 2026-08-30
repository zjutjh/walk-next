<template>
  <section :class="styles.filterSection">
    <van-cell-group inset :title="t('路线选择')">
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
            <span :class="styles.routeName">{{ t(route.title) }}</span>
            <span :class="styles.routeDistance">{{ Math.round(route.distanceKm) }}km</span>
          </van-button>
        </van-grid-item>
      </van-grid>
    </van-cell-group>
  </section>
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

const handleRouteClick = (value: RouteName) => {
  routeName.value = value;
};
</script>
