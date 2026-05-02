<!-- 点位详情 -->
<template>
  <div :class="styles.component">
    <div :class="styles.header">
      <div :class="styles.title">点位详情</div>
    </div>
    <div :class="styles.content">
      <div :class="styles.card">
        <!-- 图标水印 -->
        <van-image
          :class="styles.cardImage"
          :src="CAMPUS_CONFIG[props.campusId].pointLegendUrl"
        ></van-image>
        <!-- 点位信息 -->
        <section :class="styles.cardContent">
          <!-- 点位名称 -->
          <div :class="styles.pointName">
            {{ POINT_CONFIG[chosenPointId]?.text }}
          </div>
          <!-- 点位数据 -->
          <div :class="styles.dataList">
            <div :class="styles.data">
              <div :class="styles.dataValue">{{ detailsData?.passed_count ?? "-" }}</div>
              <div :class="styles.dataKey">经过人数</div>
            </div>
            <div :class="styles.data">
              <div :class="styles.dataValue">{{ detailsData?.not_arrived_count ?? "-" }}</div>
              <div :class="styles.dataKey">未到人数</div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div :class="styles.footer">
      <data-freshness
        :refresh-interval="ADMIN_REFRESH_INTERVAL.DASHBOARD.POINT"
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

import { ADMIN_QUERY_KEY } from "@/constants";
import { ADMIN_REFRESH_INTERVAL } from "@/constants/refresh-interval";
import { walkAdminService } from "@/utils";
import { CAMPUS_CONFIG, type CampusId, POINT_CONFIG } from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import DataFreshness from "../data-freshness/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
}>();

/** URL Query 当前选中的点位ID */
const chosenPointId = defineModel<DashboardUrlQuery["point"]>("point", { required: true });

// 获取点位详情
const {
  data: detailsData,
  dataUpdatedAt,
  isFetching,
  isError,
  refetch
} = useQuery({
  enabled: () => chosenPointId.value !== "",
  staleTime: ADMIN_REFRESH_INTERVAL.DASHBOARD.POINT,
  refetchInterval: ADMIN_REFRESH_INTERVAL.DASHBOARD.POINT,
  queryKey: [ADMIN_QUERY_KEY.DASHBOARD.POINT, chosenPointId] as const,
  queryFn: ({ queryKey }) =>
    walkAdminService.QueryDashboardPointDetails({
      point_name: queryKey[1]
    })
});

/** 手动刷新数据 */
const handleRefresh = () => {
  refetch();
};
</script>
