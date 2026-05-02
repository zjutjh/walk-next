<!-- 搜索结果列表 -->
<template>
  <van-pull-refresh
    :model-value="isRefetching"
    :class="styles.component"
    :disabled="isFetching"
    @refresh="handleRefresh"
  >
    <van-list
      :loading="isFetching"
      :error="isError && !isFetching"
      :finished="isFinished"
      :class="styles.resultList"
      @load="fetchNextPage"
    >
      <template v-for="page in teamListData?.pages">
        <van-cell-group
          v-for="team in page.teams"
          :key="team.team_id"
          :class="styles.teamInfoWrapper"
          inset
        >
          <van-cell title="队伍ID">
            {{ team.team_id }}
            <van-tag :show="team.is_lost" type="danger" size="large">失联</van-tag>
          </van-cell>
          <van-cell title="队长姓名">{{ team.captain_name }}</van-cell>
          <van-cell title="队长联系电话">{{ team.captain_phone }}</van-cell>
          <van-cell title="队伍路线">{{ ROUTE_CONFIG[team.route_name]?.text }}</van-cell>
          <van-cell title="最新经过点位">{{ POINT_CONFIG[team.prev_point_name]?.text }}</van-cell>
          <van-cell title="经过点位时间">{{
            dayjs(team.prev_point_time).format("YYYY/MM/DD HH:mm")
          }}</van-cell>
          <van-cell title="查看队伍详细信息" is-link @click="handleViewTeamDetails(team.team_id)" />
        </van-cell-group>
      </template>

      <template #loading>
        <span v-if="!isRefetching" :class="styles.loadingText"
          ><van-loading :class="styles.loadingIcon" size="0.2rem" />加载中...</span
        >
      </template>
      <template #error>
        <span class="van-haptics-feedback" :class="styles.errorText" @click="handleErrorRefetch"
          ><van-icon :class="styles.errorIcon" name="warning" />加载失败，请点击重试</span
        >
      </template>
      <template #finished>{{ finishedTipText }}</template>
      <van-back-top :class="styles.refreshBtn" immediate @click="handleRefresh">
        <van-icon size="0.3rem" name="replay" />
      </van-back-top>
    </van-list>
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { useInfiniteQuery, useQueryClient } from "@tanstack/vue-query";
import dayjs from "dayjs";
import { computed, toRef } from "vue";

import { ADMIN_QUERY_KEY } from "@/constants";
import { walkAdminService } from "@/utils";
import { type CampusId, POINT_CONFIG, ROUTE_CONFIG, SEGMENT_DERIVATIVE } from "@/walk-config";

import type { TeamListUrlQuery } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
  /** 是否可以拉取数据 */
  isQueryEnabled: boolean;
}>();

const urlQuery = defineModel<TeamListUrlQuery>("urlQuery", { required: true });

const queryClient = useQueryClient();

/** 每页项数 */
const PAGE_LIMIT = 10;

const {
  data: teamListData,
  isError,
  fetchNextPage,
  refetch,
  isRefetching,
  hasNextPage: hasMore,
  isFetching
} = useInfiniteQuery({
  enabled: () => props.isQueryEnabled,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
  queryKey: [
    ADMIN_QUERY_KEY.TEAM.LIST,
    toRef(() => urlQuery.value.keyword),
    toRef(() => urlQuery.value.searchType),
    toRef(() => urlQuery.value.segment)
  ] as const,
  queryFn: ({ queryKey, pageParam: cursor }) =>
    walkAdminService.QueryTeamList({
      campus: props.campusId,
      cursor: cursor,
      limit: PAGE_LIMIT,
      key: queryKey[1],
      search_type: queryKey[2],
      prev_point_name: SEGMENT_DERIVATIVE[queryKey[3]]?.from ?? "",
      to_point_name: SEGMENT_DERIVATIVE[queryKey[3]]?.to ?? ""
    }),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => (lastPage.next_cursor === 0 ? null : lastPage.next_cursor)
});

/** 是否已经全部拉取完成 */
const isFinished = computed(() => !(hasMore.value || isFetching.value || isError.value));

/** 全部拉取完成后的提示文本 */
const finishedTipText = computed(() => {
  // 搜到了内容
  if (teamListData.value?.pages.length && teamListData.value.pages[0]?.teams.length !== 0) {
    return "没有更多啦";
  }
  return "暂无符合条件的队伍";
});

/** 刷新 */
const handleRefresh = () => {
  // 删除缓存数据
  queryClient.setQueriesData({ queryKey: [ADMIN_QUERY_KEY.TEAM.LIST] }, () => {
    return {
      pages: [],
      pageParams: []
    };
  });
  // 重拉
  refetch();
};

/** 加载失败后重试 */
const handleErrorRefetch = () => {
  fetchNextPage();
};

/** 查看队伍详情 */
const handleViewTeamDetails = (teamId: string) => {
  urlQuery.value.viewingTeam = teamId;
};
</script>
