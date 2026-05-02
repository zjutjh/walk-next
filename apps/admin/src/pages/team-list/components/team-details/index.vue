<!-- 队伍详情浮窗 -->
<template>
  <van-popup
    :class="styles.component"
    :show="viewingTeamId !== ''"
    :overlay="false"
    position="bottom"
    destroy-on-close
    closeable
    @close="handleClose"
  >
    <div :class="styles.title">
      <span v-if="isError && !isFetching" :class="styles.errorTip"
        ><ic-baseline-error-outline :class="styles.errorIcon" />查询失败，请重试</span
      >
      <template v-else>队伍详细信息</template>
    </div>

    <loading-container
      :class="styles.loadingContainer"
      :loading="isFetching && !isPullRefreshing"
      :modal="false"
    >
      <error-empty :error="error" :disabled="!isNil(detailsData)" @retry="refetchTeamDetails">
        <van-pull-refresh
          v-if="detailsData"
          :model-value="isPullRefreshing"
          :disabled="isFetching"
          @refresh="handlePullRefresh"
        >
          <div :class="styles.details">
            <!-- 队伍总体信息 -->
            <van-cell-group :class="styles.cellGroup" inset>
              <van-cell title="队伍ID">{{ detailsData.team_id }}</van-cell>
              <van-cell title="队伍路线">{{ ROUTE_CONFIG[detailsData.route_name]?.text }}</van-cell>
              <van-cell title="最新经过点位">{{
                POINT_CONFIG[detailsData.prev_point_name]?.text
              }}</van-cell>
              <van-cell title="经过点位时间">{{
                dayjs(detailsData.prev_point_time).format("YYYY/MM/DD HH:mm")
              }}</van-cell>
              <van-cell title="标记为失联">
                <template #right-icon>
                  <van-switch
                    :model-value="detailsData.is_lost"
                    :loading="isPending"
                    :disabled="isFetching"
                    active-color="var(--van-danger-color)"
                    size="0.2rem"
                    @change="handleSwitchLost(!detailsData.is_lost)"
                  />
                </template>
              </van-cell>
            </van-cell-group>

            <!-- 队伍成员信息 -->
            <van-cell-group :class="styles.cellGroup" inset>
              <!-- 特殊成员信息 -->
              <template
                v-for="(member, index) in specialMemberList"
                :key="`${member.name}${index}`"
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

              <!-- 前往修改成员状态 -->
              <van-cell
                :to="`/TODO:等团队信息页确定路由后填写/${detailsData.team_id}`"
                title="修改队伍成员状态"
                is-link
              />
            </van-cell-group>
          </div>
        </van-pull-refresh>
      </error-empty>
    </loading-container>
  </van-popup>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AdminAPI } from "api/types/admin";
import dayjs from "dayjs";
import { isNil } from "lodash-es";
import { showFailToast, showSuccessToast } from "vant";
import { computed, ref, watch } from "vue";

import errorEmpty from "@/components/error-empty/index.vue";
import loadingContainer from "@/components/loading-container/index.vue";
import { ADMIN_QUERY_KEY, TEAM_MEMBER_ROLE_TEXT } from "@/constants";
import { walkAdminService } from "@/utils";
import { POINT_CONFIG, ROUTE_CONFIG } from "@/walk-config";
import IcBaselineErrorOutline from "~icons/ic/baseline-error-outline";

import type { TeamListUrlQuery } from "../../types";
import styles from "./index.module.scss";

/** URL Query 正在查看详情的队伍的ID */
const viewingTeamId = defineModel<TeamListUrlQuery["viewingTeam"]>("teamId", { required: true });

const queryClient = useQueryClient();

/** 关闭队伍详情浮层 */
const handleClose = () => {
  viewingTeamId.value = "";
};

// 获取队伍详情
const {
  data: detailsData,
  isRefetching,
  isFetching,
  isError,
  error,
  refetch: refetchTeamDetails
} = useQuery({
  enabled: () => viewingTeamId.value !== "",
  queryKey: [ADMIN_QUERY_KEY.TEAM.DETAILS, viewingTeamId] as const,
  queryFn: ({ queryKey }) =>
    walkAdminService.QueryTeamDetails({
      team_id: queryKey[1]
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

// 设置队伍失联状态
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
    queryClient.setQueryData(
      [ADMIN_QUERY_KEY.TEAM.DETAILS, viewingTeamId],
      (oldData: AdminAPI.QueryTeamDetailsResponse) => ({
        ...oldData,
        is_lost: targetValue
      })
    );
  },
  onSettled: () => {
    // 刷新队伍详情
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
watch(isRefetching, (newValue) => {
  if (newValue === false) isPullRefreshing.value = false;
});

/** 下拉刷新队伍详情 */
const handlePullRefresh = () => {
  // 展示下拉刷新态
  isPullRefreshing.value = true;

  refetchTeamDetails();
};
</script>
