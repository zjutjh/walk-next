<!-- 数据统计表格页 -->
<template>
  <default-layout :class="styles.layout">
    <van-tabs v-model:active="urlQuery.tab" :class="styles.tabs" animated swipeable>
      <!-- 总览统计数据 -->
      <van-tab title="总览" :name="OVERVIEW_TAB_NAME">
        <error-tip
          v-if="overviewStatsError && !isOverviewStatsFetching"
          :class="styles.errorTip"
          :data-updated-at="overviewStatsUpdatedAt"
        />
        <loading-container
          :class="styles.loadingContainer"
          :loading="isOverviewStatsLoading"
          :modal="false"
        >
          <error-empty
            :error="overviewStatsError"
            :disabled="!isNil(overviewStatsData)"
            @retry="refetchOverviewStats"
          >
            <van-pull-refresh
              v-if="overviewStatsData"
              :model-value="isOverviewStatsPullRefreshing"
              :disabled="isOverviewStatsFetching"
              @refresh="handleOverviewStatsRefresh"
            >
              <div :class="styles.dataContainer">
                <van-cell-group
                  v-for="routeData in overviewStatsData?.routes"
                  :key="routeData.route_name"
                  :title="ROUTE_CONFIG[routeData.route_name]?.text"
                  inset
                >
                  <van-cell
                    v-for="(value, key) in routeData.stats"
                    :key="key"
                    :title="WALKER_STATS_METRIC_TEXT[key]"
                    :value="value ?? '-'"
                  />
                </van-cell-group>
              </div>
            </van-pull-refresh>
          </error-empty>
        </loading-container>
      </van-tab>

      <!-- 具体路线统计数据 -->
      <van-tab
        v-for="route in ROUTE_LIST"
        :key="route"
        :title="ROUTE_CONFIG[route]?.text"
        :name="route"
      >
        <error-tip
          v-if="routeStatsError && !isRouteStatsFetching"
          :class="styles.errorTip"
          :data-updated-at="routeStatsUpdatedAt"
        />
        <loading-container
          :class="styles.loadingContainer"
          :loading="isRouteStatsLoading"
          :modal="false"
        >
          <error-empty
            :error="routeStatsError"
            :disabled="!isNil(routeStatsData)"
            @retry="refetchRouteStats"
          >
            <van-pull-refresh
              v-if="routeStatsData"
              :model-value="isRouteStatsPullRefreshing"
              :disabled="isRouteStatsFetching"
              @refresh="handleRouteStatsRefresh"
            >
              <div :key="urlQuery.tab" :class="styles.dataContainer">
                <!-- 经过点位人数 -->
                <van-cell-group inset title="经过点位人数">
                  <van-cell
                    v-for="pointData in routeStatsData?.point_stats"
                    :key="pointData.point_name"
                    :title="POINT_CONFIG[pointData.point_name]?.text"
                    :value="pointData.passed_count"
                  />
                </van-cell-group>

                <!-- 点位间人数 -->
                <van-cell-group inset title="点位间人数">
                  <van-cell
                    v-for="segmentData in segmentStats"
                    :key="segmentData.segmentKey"
                    :title="segmentData.text"
                    :value="segmentData.countOnSegment ?? '-'"
                  />
                </van-cell-group>

                <!-- 路段统计指标 -->
                <van-cell-group inset title="状态">
                  <van-cell
                    v-for="(value, key) in routeStatsData?.status_stats"
                    :key="key"
                    :title="WALKER_STATS_METRIC_TEXT[key]"
                    :value="value ?? '-'"
                  />
                </van-cell-group>
              </div>
            </van-pull-refresh>
          </error-empty>
        </loading-container>
      </van-tab>
    </van-tabs>
  </default-layout>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { isEmpty, isNil, last } from "lodash-es";
import { computed, ref, toRef, watch } from "vue";

import LoadingContainer from "@/components/loading-container/index.vue";
import { useStoredUrlQuery } from "@/composables/stored-url-query";
import { ADMIN_QUERY_KEY } from "@/constants";
import { WALKER_STATS_METRIC_TEXT } from "@/constants/enum-text";
import { ADMIN_REFRESH_INTERVAL } from "@/constants/refresh-interval";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils";
import {
  POINT_CONFIG,
  ROUTE_CONFIG,
  ROUTE_LIST,
  SEGMENT_DERIVATIVE,
  SEGMENT_KEY_DELIMITER
} from "@/walk-config";

import ErrorTip from "./components/error-tip/index.vue";
import { OVERVIEW_TAB_NAME } from "./constants";
import styles from "./index.module.scss";
import type { DataTableUrlQuery } from "./types";

const { urlQuery } = useStoredUrlQuery<DataTableUrlQuery>({
  initialValue: {
    tab: OVERVIEW_TAB_NAME
  },
  persist: "memory"
});

// 获取总览统计数据
const {
  data: overviewStatsData,
  error: overviewStatsError,
  isLoading: isOverviewStatsLoading,
  isFetching: isOverviewStatsFetching,
  refetch: refetchOverviewStats,
  dataUpdatedAt: overviewStatsUpdatedAt
} = useQuery({
  enabled: () => urlQuery.value.tab === OVERVIEW_TAB_NAME,
  staleTime: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
  refetchInterval: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
  queryKey: [ADMIN_QUERY_KEY.STATS.OVERVIEW],
  queryFn: () => walkAdminService.QueryOverviewStats(undefined)
});

/** 总览统计数据是否正在下拉刷新中 */
const isOverviewStatsPullRefreshing = ref(false);
// 总览统计数据refetch结束时关闭下拉刷新态
watch(isOverviewStatsFetching, (newValue) => {
  if (newValue === false) isOverviewStatsPullRefreshing.value = false;
});

/** 下拉刷新总览统计数据 */
const handleOverviewStatsRefresh = () => {
  // 展示下拉刷新态
  isOverviewStatsPullRefreshing.value = true;

  refetchOverviewStats();
};

// 获取路线统计数据
const {
  data: routeStatsData,
  error: routeStatsError,
  isLoading: isRouteStatsLoading,
  isFetching: isRouteStatsFetching,
  refetch: refetchRouteStats,
  dataUpdatedAt: routeStatsUpdatedAt
} = useQuery({
  enabled: () => urlQuery.value.tab !== OVERVIEW_TAB_NAME,
  staleTime: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
  refetchInterval: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
  queryKey: [ADMIN_QUERY_KEY.STATS.ROUTE, toRef(() => urlQuery.value.tab)] as const,
  queryFn: ({ queryKey }) => walkAdminService.QueryRouteStats({ name: queryKey[1] })
});

/** 路线统计数据是否正在下拉刷新中 */
const isRouteStatsPullRefreshing = ref(false);
// 路线统计数据refetch结束时关闭下拉刷新态
watch(isRouteStatsFetching, (newValue) => {
  if (newValue === false) isRouteStatsPullRefreshing.value = false;
});

/** 下拉刷新路线统计数据 */
const handleRouteStatsRefresh = () => {
  // 展示下拉刷新态
  isRouteStatsPullRefreshing.value = true;

  refetchRouteStats();
};

/** 行程段统计数据 */
const segmentStats = computed(() => {
  /** 最后一个点位的数据 */
  const lastPointData = last(routeStatsData.value?.point_stats);
  /** 除最后一个点位外的点位数据数组 */
  const pointDataArrExceptLast = routeStatsData.value?.point_stats.slice(0, -1);
  if (isNil(pointDataArrExceptLast) || isEmpty(pointDataArrExceptLast) || isNil(lastPointData))
    return [];
  return pointDataArrExceptLast.map((pointData, index, pointArr) => {
    /** 下一个点位的数据 */
    const nextPointData = pointArr.at(index + 1) ?? lastPointData;
    /** 行程段key */
    const segmentKey = `${pointData.point_name}${SEGMENT_KEY_DELIMITER}${nextPointData.point_name}`;
    const segmentData = {
      segmentKey: segmentKey,
      text: SEGMENT_DERIVATIVE[segmentKey]?.text ?? "",
      countOnSegment: pointData.passed_count - nextPointData.passed_count
    };
    return segmentData;
  });
});
</script>
