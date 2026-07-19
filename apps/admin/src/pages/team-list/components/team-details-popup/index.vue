<!-- 团队详情弹层 -->
<template>
  <van-popup
    :class="styles.component"
    :show="viewingTeamId !== 0"
    :overlay="false"
    position="bottom"
    destroy-on-close
    closeable
    @close="handleClose"
  >
    <!-- 弹层的标题栏 -->
    <div :class="styles.title">
      <span v-if="isError && !isFetching" :class="styles.errorTip"
        ><ic-baseline-error-outline :class="styles.errorIcon" />查询失败，请重试</span
      >
      <template v-else>团队详细信息</template>
    </div>

    <loading-container
      :class="styles.loadingContainer"
      :loading="isFetching && !isPullRefreshing"
      :modal="false"
    >
      <error-empty :error="error" :disabled="!isNil(detailsData)" @btn-click="refetchTeamDetails">
        <van-pull-refresh
          v-if="detailsData"
          :model-value="isPullRefreshing"
          :disabled="isFetching"
          @refresh="handlePullRefresh"
        >
          <div :class="styles.details">
            <!-- 团队总体信息 -->
            <van-cell-group :class="styles.cellGroup" inset>
              <van-cell title="团队ID">{{ detailsData.team_id }}</van-cell>
              <van-cell title="团队路线">{{ ROUTE_CONFIG[detailsData.route_name]?.text }}</van-cell>
              <van-cell title="最新经过点位">{{
                POINT_CONFIG[detailsData.latest_point_name]?.text
              }}</van-cell>
              <van-cell title="经过点位时间">{{
                dayjs(detailsData.latest_point_time).format("YYYY/MM/DD HH:mm")
              }}</van-cell>
              <!-- 失联开关 -->
              <van-cell title="标记为失联">
                <template #right-icon>
                  <van-switch
                    :model-value="detailsData.is_lost"
                    :loading="isPending"
                    :disabled="isFetching"
                    active-color="var(--van-danger-color)"
                    size="0.2rem"
                    @change="handleSwitchLost"
                  />
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 团队成员信息 -->
            <van-cell-group :class="styles.cellGroup" inset>
              <!-- 特殊成员信息 -->
              <template
                v-for="(member, index) in specialMemberList"
                :key="`${member.role}${member.name}${member.phone}${index}`"
              >
                <van-cell>
                  <template #title>{{ TEAM_MEMBER_ROLE_TEXT[member.role] }}姓名</template>
                  {{ member.name }}
                </van-cell>
                <van-cell>
                  <template #title>{{ TEAM_MEMBER_ROLE_TEXT[member.role] }}联系电话</template>
                  {{ member.phone }}
                </van-cell>
              </template>

              <!-- 普通成员信息 -->
              <template v-for="(member, index) in normalMemberList" :key="`${member.name}${index}`">
                <van-cell>
                  <template #title
                    >{{ TEAM_MEMBER_ROLE_TEXT[member.role] }}{{ index + 1 }}姓名</template
                  >
                  {{ member.name }}
                </van-cell>
                <van-cell>
                  <template #title
                    >{{ TEAM_MEMBER_ROLE_TEXT[member.role] }}{{ index + 1 }}联系电话</template
                  >
                  {{ member.phone }}
                </van-cell>
              </template>

              <!-- 前往修改成员状态按钮 -->
              <van-cell :to="`/team/${detailsData.team_id}`" title="修改团队成员状态" is-link />
            </van-cell-group>
          </div>
        </van-pull-refresh>
      </error-empty>
    </loading-container>
  </van-popup>
</template>

<script setup lang="ts">
import { type InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AdminAPI } from "api/types/admin";
import dayjs from "dayjs";
import { isNil } from "lodash-es";
import { ErrorEmpty, LoadingContainer, patchInfiniteQueryPages } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed, ref, watch } from "vue";

import { ADMIN_QUERY_KEY, TEAM_MEMBER_ROLE_TEXT } from "@/constants";
import { walkAdminService } from "@/utils";
import { type CampusId, POINT_CONFIG, ROUTE_CONFIG } from "@/walk-config";
import IcBaselineErrorOutline from "~icons/ic/baseline-error-outline";

import type { TeamListUrlQuery } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  /** 校区ID */
  campusId: CampusId;
}>();

/** URL Query 正在查看详情的团队的ID */
const viewingTeamId = defineModel<TeamListUrlQuery["viewingTeam"]>("teamId", { required: true });

const queryClient = useQueryClient();

/** 关闭团队详情浮层 */
const handleClose = () => {
  viewingTeamId.value = 0;
};

// 获取团队详情
const {
  data: detailsData,
  isRefetching,
  isFetching,
  isError,
  error,
  refetch: refetchTeamDetails
} = useQuery({
  enabled: () => viewingTeamId.value !== 0,
  queryKey: [ADMIN_QUERY_KEY.TEAM.DETAILS, viewingTeamId] as const,
  queryFn: ({ queryKey }) =>
    walkAdminService.QueryTeamDetails({
      team_id: Number(queryKey[1])
    })
});

/** 特殊成员列表 */
const specialMemberList = computed(() =>
  detailsData.value ? detailsData.value.members.filter((member) => member.role === "captain") : []
);

/** 普通成员列表 */
const normalMemberList = computed(() =>
  detailsData.value ? detailsData.value.members.filter((member) => member.role === "member") : []
);

// 设置团队失联状态
const { mutate: mutateLost, isPending } = useMutation({
  mutationFn: (targetValue: boolean) =>
    walkAdminService.SetTeamLost({
      team_id: viewingTeamId.value,
      is_lost: targetValue
    }),
  onError: (err) => {
    showFailToast(err.message || "设置失败");
  },
  onSuccess: (_data, targetValue) => {
    showSuccessToast(targetValue ? "已标记失联" : "已取消标记");
    // 提前更新缓存中的失联状态
    queryClient.setQueryData<AdminAPI.QueryTeamDetailsResponse>(
      [ADMIN_QUERY_KEY.TEAM.DETAILS, viewingTeamId],
      (oldData) => {
        if (isNil(oldData)) return oldData;
        return {
          ...oldData,
          is_lost: targetValue
        };
      }
    );
    // 更新搜索列表中的缓存
    queryClient.setQueriesData<InfiniteData<AdminAPI.QueryTeamListResponse>>(
      { queryKey: [ADMIN_QUERY_KEY.TEAM.LIST, props.campusId] },
      (oldData) =>
        patchInfiniteQueryPages(oldData, (page) => ({
          ...page,
          teams: page.teams.map((team) => {
            if (team.team_id !== viewingTeamId.value) return team;
            return {
              ...team,
              is_lost: targetValue
            };
          })
        }))
    );
  },
  onSettled: () => {
    // 刷新团队详情
    refetchTeamDetails();
  }
});

/** 更改失联状态 */
const handleSwitchLost = (targetValue: boolean) => {
  mutateLost(targetValue);
};

/** 是否正在下拉刷新中 */
const isPullRefreshing = ref(false);
// refetch结束时关闭下拉刷新态
watch(
  () => isRefetching.value,
  (newValue) => {
    if (newValue === false) isPullRefreshing.value = false;
  },
  { immediate: true }
);

/** 下拉刷新团队详情 */
const handlePullRefresh = () => {
  // 展示下拉刷新态
  isPullRefreshing.value = true;

  refetchTeamDetails();
};
</script>
