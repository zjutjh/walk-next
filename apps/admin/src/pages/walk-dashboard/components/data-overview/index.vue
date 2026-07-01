<!-- 底部数据总览面板 -->
<template>
  <div :class="styles.component">
    <div :class="styles.header">
      <div :class="styles.title">数据总览</div>
    </div>
    <div :class="styles.content">
      <error-empty
        :error="error"
        :disabled="!isNil(overviewData)"
        :show-retry="false"
        image-size="1rem"
      >
        <van-skeleton :class="styles.skeleton" title :row="4" :loading="isLoading">
          <div
            v-for="routeData in overviewData?.routes"
            :key="routeData.route_name"
            :class="styles.card"
            :style="{
              '--jh-walk-data-card-color':
                ROUTE_CONFIG[routeData.route_name as RouteId]?.dataCardColor
            }"
          >
            <div :class="styles.cardTitle">
              <strong>{{ ROUTE_CONFIG[routeData.route_name as RouteId]?.text }}</strong>
            </div>
            <div :class="styles.data">
              <span :class="styles.dataKey">总报名</span
              ><span :class="styles.dataValue">{{ routeData.total_reg }}</span>
            </div>
            <div :class="styles.data">
              <span :class="styles.dataKey">进行中</span
              ><span :class="styles.dataValue">{{ routeData.walking }}</span>
            </div>
            <div :class="styles.data">
              <span :class="styles.dataKey">已结束</span
              ><span :class="styles.dataValue">{{ routeData.finished }}</span>
            </div>
            <div :class="styles.data">
              <span :class="styles.dataKey">走错路线</span
              ><span :class="styles.dataValue">{{ routeData.wrong_route }}</span>
            </div>
          </div>
        </van-skeleton>
      </error-empty>
    </div>
    <div :class="styles.footer">
      <data-freshness
        :refresh-interval="ADMIN_REFRESH_INTERVAL.DASHBOARD.OVERVIEW"
        :data-updated-at="dataUpdatedAt"
        :is-fetching="isFetching"
        :is-error="isError"
        @refresh="handleRefresh"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { isNil } from "lodash-es";

import errorEmpty from "@/components/error-empty/index.vue";
import { ADMIN_QUERY_KEY } from "@/constants";
import { ADMIN_REFRESH_INTERVAL } from "@/constants/refresh-interval";
import { walkAdminService } from "@/utils";
import { type CampusId, ROUTE_CONFIG, type RouteId } from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import DataFreshness from "../data-freshness/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  /** URL Query */
  urlQuery: DashboardUrlQuery;
  /** 校区ID */
  campusId: CampusId;
}>();

// 获取校区总览数据
const {
  data: overviewData,
  dataUpdatedAt,
  isLoading,
  isFetching,
  isError,
  error,
  refetch
} = useQuery({
  enabled: () => props.urlQuery.point === "" && props.urlQuery.segment === "",
  staleTime: ADMIN_REFRESH_INTERVAL.DASHBOARD.OVERVIEW,
  refetchInterval: ADMIN_REFRESH_INTERVAL.DASHBOARD.OVERVIEW,
  queryKey: [ADMIN_QUERY_KEY.DASHBOARD.OVERVIEW, props.campusId] as const,
  queryFn: ({ queryKey }) =>
    walkAdminService.QueryDashboardCampusOverview({
      campus: queryKey[1]
    })
});

/** 手动刷新数据 */
const handleRefresh = () => {
  refetch();
};
</script>
