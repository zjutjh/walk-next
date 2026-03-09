<!-- 行程段详情 -->
<template>
  <div :class="styles.component">
    <div :class="styles.header">
      <div :class="styles.title">路段详情</div>
      <!-- 查看行程段队伍列表链接 -->
      <div class="van-haptics-feedback" :class="styles.teamListLink" @click="handleViewTeamList">
        查看路段队伍列表&nbsp;>
      </div>
    </div>
    <div :class="styles.content">
      <div :class="styles.card">
        <!-- 行程段信息 -->
        <section :class="styles.cardContent">
          <!-- 行程段名称 -->
          <div :class="styles.segmentName">
            {{ SEGMENT_DERIVATIVE[chosenSegmentKey]?.text }}
          </div>
          <!-- 行程段数据 -->
          <div :class="styles.dataList">
            <div :class="styles.data">
              <div :class="styles.dataValue">{{ detailsData?.number || "-" }}</div>
              <div :class="styles.dataKey">路段人数</div>
            </div>
            <div :class="styles.data">
              <div :class="styles.dataValue">{{ segmentBelongsTo }}</div>
              <div :class="styles.dataKey">所属路线</div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <div :class="styles.footer">
      <data-freshness
        :refresh-interval="REFRESH_INTERVAL"
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
import { includes } from "lodash-es";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { ADMIN_QUERY_KEY } from "@/constants";
import { walkAdminService } from "@/utils";
import {
  CAMPUS_ROUTE_LIST_MAP,
  type CampusId,
  ROUTE_CONFIG,
  ROUTE_SEGMENT_LIST_MAP,
  SEGMENT_DERIVATIVE
} from "@/walk-config";

import type { DashboardUrlQuery } from "../../types";
import DataFreshness from "../data-freshness/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
}>();

const router = useRouter();

/** URL Query 当前选中的行程段key */
const chosenSegmentKey = defineModel<DashboardUrlQuery["segment"]>("segment", { required: true });

/** 数据自动刷新间隔（秒） */
const REFRESH_INTERVAL = 30;

/** 行程段所归属的路线 */
const segmentBelongsTo = computed(() => {
  if (chosenSegmentKey.value === "") return "";
  // 遍历当前校区所有路线 筛选出所有含有此行程段的路线
  const belongingList = CAMPUS_ROUTE_LIST_MAP[props.campusId].filter((routeId) =>
    includes(ROUTE_SEGMENT_LIST_MAP[routeId], chosenSegmentKey.value)
  );
  // 所有路线都包含时 简洁返回
  if (belongingList.length === CAMPUS_ROUTE_LIST_MAP[props.campusId].length) {
    return "所有路线";
  }
  // 拼接所有路线名
  return belongingList.map((routeId) => ROUTE_CONFIG[routeId].text).join("&");
});

// 获取行程段详情
const {
  data: detailsData,
  dataUpdatedAt,
  isFetching,
  isError,
  refetch
} = useQuery({
  enabled: () => chosenSegmentKey.value !== "",
  staleTime: REFRESH_INTERVAL * 1000,
  refetchInterval: REFRESH_INTERVAL * 1000,
  queryKey: [ADMIN_QUERY_KEY.DASHBOARD.SEGMENT, chosenSegmentKey] as const,
  queryFn: ({ queryKey }) => {
    if (queryKey[1] === "") return;
    return walkAdminService.QueryDashboardSegmentDetails({
      prev_point_name: SEGMENT_DERIVATIVE[queryKey[1]].from,
      to_point_name: SEGMENT_DERIVATIVE[queryKey[1]].to
    });
  }
});

/** 手动刷新数据 */
const handleRefresh = () => {
  refetch();
};

/** 查看行程段队伍列表 */
const handleViewTeamList = () => {
  router.push({ path: `/team-list/${props.campusId}`, query: { segment: chosenSegmentKey.value } });
};
</script>
