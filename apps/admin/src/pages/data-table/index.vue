<!-- 数据统计表格页 -->
<template>
  <default-layout :class="styles.layout">
    <van-tabs v-model:active="urlQuery.tab" :class="styles.tabs" animated swipeable>
      <!-- 总览统计数据 -->
      <van-tab title="总览" :name="OVERVIEW_TAB_NAME">
        <error-tip
          v-if="overviewStatsError && !isOverviewStatsFetching && overviewStatsData"
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
            @btn-click="refetchOverviewStats"
          >
            <van-pull-refresh
              v-if="overviewStatsData"
              :model-value="isOverviewStatsPullRefreshing"
              :disabled="isOverviewStatsFetching"
              @refresh="handleOverviewStatsRefresh"
            >
              <div :class="styles.dataContainer">
                <!-- 路线总览卡片 -->
                <cell-group
                  v-for="routeData in overviewStatsData?.routes"
                  :key="routeData.route_name"
                  :loading="isOverviewStatsFetching"
                  :title="ROUTE_CONFIG[routeData.route_name]?.text"
                  inset
                >
                  <van-cell
                    v-for="key in OVERVIEW_STATS_KEY_LIST"
                    :key="key"
                    :title="MEMBER_STATS_METRIC_TEXT[key]"
                    >{{ routeData.stats[key] ?? "-" }}</van-cell
                  >
                </cell-group>
              </div>
            </van-pull-refresh>
          </error-empty>
        </loading-container>
      </van-tab>

      <!-- 具体路线统计数据 -->
      <template v-for="campusId in CAMPUS_LIST" :key="campusId">
        <van-tab
          v-for="routeId in CAMPUS_ROUTE_LIST_MAP[campusId]"
          :key="routeId"
          :title="ROUTE_CONFIG[routeId]?.text"
          :name="routeId"
        >
          <!-- 数据拉取失败提示 -->
          <error-tip
            v-if="
              routeStatsQueryMap[routeId]?.error &&
              !routeStatsQueryMap[routeId]?.isFetching &&
              routeStatsQueryMap[routeId]?.data
            "
            :class="styles.errorTip"
            :data-updated-at="routeStatsQueryMap[routeId]?.dataUpdatedAt"
          />

          <loading-container
            v-if="routeStatsQueryMap[routeId]"
            :class="styles.loadingContainer"
            :loading="routeStatsQueryMap[routeId].isLoading"
            :modal="false"
          >
            <error-empty
              :error="routeStatsQueryMap[routeId].error"
              :disabled="!isNil(routeStatsQueryMap[routeId]?.data)"
              @btn-click="routeStatsQueryMap[routeId].refetch()"
            >
              <van-pull-refresh
                :model-value="isRouteStatsPullRefreshingMap[routeId]"
                :disabled="routeStatsQueryMap[routeId].isFetching"
                @refresh="handleRouteStatsRefresh(routeId)"
              >
                <div :key="urlQuery.tab" :class="styles.dataContainer">
                  <!-- 经过点位人数 -->
                  <cell-group
                    :loading="routeStatsQueryMap[routeId].isFetching"
                    inset
                    title="经过点位人数"
                  >
                    <van-cell
                      v-for="pointData in routeStatsQueryMap[routeId].data?.point_stats"
                      :key="pointData.point_name"
                      :title="POINT_CONFIG[pointData.point_name]?.text"
                      >{{ pointData.passed_count ?? "-" }}</van-cell
                    >
                  </cell-group>

                  <!-- 点位间人数 -->
                  <cell-group
                    :loading="routeStatsQueryMap[routeId].isFetching"
                    inset
                    title="点位间人数"
                  >
                    <van-cell
                      v-for="segmentData in segmentStatsMap[routeId]?.value"
                      :key="segmentData.segmentKey"
                      :title="segmentData.text"
                      is-link
                      :to="`/team-list/${campusId}?segment=${segmentData.segmentKey}`"
                      >{{ segmentData.countOnSegment ?? "-" }}</van-cell
                    >
                  </cell-group>

                  <!-- 路线统计指标 -->
                  <cell-group :loading="routeStatsQueryMap[routeId].isFetching" inset title="状态">
                    <van-cell
                      v-for="key in ROUTE_STATS_KEY_LIST"
                      :key="key"
                      :title="MEMBER_STATS_METRIC_TEXT[key]"
                      >{{ routeStatsQueryMap[routeId].data?.status_stats[key] ?? "-" }}</van-cell
                    >
                  </cell-group>
                </div>
              </van-pull-refresh>
            </error-empty>
          </loading-container>
        </van-tab>
      </template>
    </van-tabs>
  </default-layout>
</template>

<script setup lang="ts">
import { useQueries, useQuery } from "@tanstack/vue-query";
import { whenever } from "@vueuse/core";
import { forEach, fromPairs, isNil, map, zipObject } from "lodash-es";
import { CellGroup, ErrorEmpty, LoadingContainer, useStoredUrlQuery } from "shared";
import { computed, reactive, ref } from "vue";

import { ADMIN_QUERY_KEY, ADMIN_REFRESH_INTERVAL, MEMBER_STATS_METRIC_TEXT } from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils";
import {
  CAMPUS_LIST,
  CAMPUS_ROUTE_LIST_MAP,
  POINT_CONFIG,
  ROUTE_CONFIG,
  ROUTE_LIST,
  type RouteId,
  SEGMENT_DERIVATIVE,
  SEGMENT_KEY_DELIMITER
} from "@/walk-config";

import ErrorTip from "./components/error-tip/index.vue";
import { OVERVIEW_STATS_KEY_LIST, OVERVIEW_TAB_NAME, ROUTE_STATS_KEY_LIST } from "./constants";
import styles from "./index.module.scss";
import type { DataTableUrlQuery, SegmentStat } from "./types";

const { urlQuery } = useStoredUrlQuery<DataTableUrlQuery>({
  defaultValue: {
    tab: OVERVIEW_TAB_NAME
  },
  persist: sessionStorage
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
whenever(
  () => !isOverviewStatsFetching.value,
  () => {
    isOverviewStatsPullRefreshing.value = false;
  }
);

/** 下拉刷新总览统计数据 */
const handleOverviewStatsRefresh = () => {
  // 展示下拉刷新态
  isOverviewStatsPullRefreshing.value = true;

  refetchOverviewStats();
};

// 获取路线统计数据
const routeStatsQueryMap = useQueries({
  queries: ROUTE_LIST.map((routeId) => ({
    enabled: () => urlQuery.value.tab === routeId,
    staleTime: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
    refetchInterval: ADMIN_REFRESH_INTERVAL.TABLE.STATS,
    queryKey: [ADMIN_QUERY_KEY.STATS.ROUTE, routeId] as const,
    queryFn: () => walkAdminService.QueryRouteStats({ name: routeId })
  })),
  combine: (results) => zipObject(ROUTE_LIST, results)
});

/** 路线统计数据是否正在下拉刷新中 */
const isRouteStatsPullRefreshingMap = reactive(
  fromPairs(map(ROUTE_LIST, (routeId) => [routeId, false]))
);
// 路线统计数据refetch结束时关闭下拉刷新态
forEach(ROUTE_LIST, (routeId) => {
  whenever(
    () => !routeStatsQueryMap.value[routeId]?.isFetching,
    () => {
      isRouteStatsPullRefreshingMap[routeId] = false;
    }
  );
});

/** 下拉刷新路线统计数据 */
const handleRouteStatsRefresh = (routeId: RouteId) => {
  // 展示下拉刷新态
  isRouteStatsPullRefreshingMap[routeId] = true;

  routeStatsQueryMap.value[routeId]?.refetch();
};

/** 行程段统计数据 */
const segmentStatsMap = fromPairs(
  map(ROUTE_LIST, (routeId) => [
    routeId,
    computed(() => {
      /** 点位数据数组 */
      const pointDataArr = routeStatsQueryMap.value[routeId]?.data?.point_stats ?? [];
      return pointDataArr.reduce((acc, pointData, index) => {
        /** 下一个点位的数据 */
        const nextPointData = pointDataArr.at(index + 1);
        // 没有下一个点位数据
        if (isNil(nextPointData)) return acc;
        /** 行程段key */
        const segmentKey = `${pointData.point_name}${SEGMENT_KEY_DELIMITER}${nextPointData.point_name}`;
        // 添加当前点位到下一个点位的行程段数据
        acc.push({
          segmentKey: segmentKey,
          text: SEGMENT_DERIVATIVE[segmentKey]?.text ?? "",
          countOnSegment: nextPointData.count_on_prev_segment ?? 0
        });
        return acc;
      }, [] as SegmentStat[]);
    })
  ])
);
</script>
