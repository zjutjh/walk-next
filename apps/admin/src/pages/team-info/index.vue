<!-- 团队信息页 -->
<template>
  <default-layout
    :class="styles.page"
    :title="teamInfoData?.team.name || undefined"
    :back-disabled="isAnyMutationPending"
    :loading="isTeamInfoLoading || isAnyMutationPending"
  >
    <error-empty :error="teamInfoError" :disabled="isTeamInfoFetching" @btn-click="refetchTeamInfo">
      <van-pull-refresh
        v-if="teamInfoData"
        :model-value="isPullRefreshing"
        :disabled="isTeamInfoFetching"
        @refresh="handleRefresh"
      >
        <div :class="styles.contentContainer">
          <!-- 团队总体信息 -->
          <van-cell-group :class="styles.overviewCard" inset>
            <van-cell title="团队路线">
              <van-tag
                :class="styles.cellValueTag"
                :show="Boolean(teamInfoData.team.is_wrong_route)"
                type="warning"
                size="large"
                >走错</van-tag
              >
              {{ ROUTE_CONFIG[teamInfoData.team.route_name]?.text }}</van-cell
            >
            <van-cell title="团队剩余人数">
              {{ remainingCount ?? "-" }}
            </van-cell>
            <van-cell title="上个打卡点位">
              <van-tag
                :class="styles.cellValueTag"
                :show="Boolean(teamInfoData.team.is_prev_point_invalid)"
                type="danger"
                size="large"
                >异常</van-tag
              >
              {{ POINT_CONFIG[teamInfoData.team.prev_point_name]?.text ?? "-" }}
            </van-cell>
          </van-cell-group>

          <!-- 成员信息 -->
          <cell-group :loading="isTeamInfoFetching" title="成员状态" inset>
            <van-cell
              v-for="member in teamInfoData.members"
              :key="member.user_id"
              :title="member.name"
              is-link
              @click="openMemberActionSheet(member.user_id)"
            >
              <van-tag
                :class="styles.cellValueTag"
                :show="Boolean(member.is_violated)"
                type="danger"
                size="large"
                >违规</van-tag
              >
              <span :style="{ color: MEMBER_WALK_STATUS_COLOR_MAP[member.walk_status] }">{{
                MEMBER_WALK_STATUS_TEXT[member.walk_status]
              }}</span>
            </van-cell>
          </cell-group>

          <div :class="styles.middleWhiteSpace"></div>

          <!-- 功能按钮列表 -->
          <button-list
            :class="styles.buttonContainer"
            :team-id="teamId"
            :team-info-data="teamInfoData"
            :is-start-point-manage-available="isStartPointManageAvailable"
            :is-end-point-manage-available="isEndPointManageAvailable"
            @mutate-team-violated="mutateMarkTeamViolated"
            @mutate-confirm-destination="mutateConfirmDestination"
            @mutate-bind-checkin-code="mutateBindCheckinCode"
          />
        </div>
      </van-pull-refresh>
    </error-empty>

    <!-- 成员操作弹层 -->
    <member-action-sheet
      v-model:visible="isMemberActionSheetVisible"
      v-model:member-id="memberActionSheetMemberId"
      :team-id="teamId"
      :team-info-data="teamInfoData"
      :is-start-point-manage-available="isStartPointManageAvailable"
      :is-end-point-manage-available="isEndPointManageAvailable"
      @mutate-walk-status="mutateUpdateMemberWalkStatus"
      @mutate-violated="mutateUpdateMemberViolated"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AdminAPI, MemberWalkStatus } from "api/types/admin";
import { first, isNil, last } from "lodash-es";
import { CellGroup, ErrorEmpty } from "shared";
import { showDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref, watch } from "vue";

import { useAdminInfo } from "@/composables";
import {
  ADMIN_QUERY_KEY,
  MEMBER_WALK_STATUS_COLOR_MAP,
  MEMBER_WALK_STATUS_TEXT
} from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils";
import { POINT_CONFIG, ROUTE_CONFIG, ROUTE_POINT_LIST_MAP } from "@/walk-config";

import ButtonList from "./components/button-list/index.vue";
import MemberActionSheet from "./components/member-action-sheet/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  /** Path Param传入的团队ID */
  teamIdParam: string;
}>();
/** 团队ID */
const teamId = computed(() => parseInt(props.teamIdParam));

const queryClient = useQueryClient();
const { adminPointId } = useAdminInfo();

/** 是否已经弹出过走错路线提示 */
const isWrongRouteAlertTriggered = ref(false);

/** 团队剩余人数 */
const remainingCount = computed(
  () =>
    teamInfoData.value?.members.filter(
      (member) => member.walk_status !== "abandoned" && member.walk_status !== "withdrawn"
    ).length
);

/** 成员操作弹层当前操作的成员ID */
const memberActionSheetMemberId = ref<number>();
/** 成员操作弹层是否可见 */
const isMemberActionSheetVisible = ref(false);
/** 打开成员操作弹层 */
const openMemberActionSheet = (id: number) => {
  memberActionSheetMemberId.value = id;
  isMemberActionSheetVisible.value = true;
};

/** 起点管理功能是否可用 */
const isStartPointManageAvailable = computed(() =>
  Boolean(
    teamInfoData.value &&
    // 当前管理员用户在团队所属路线的起点
    adminPointId.value === first(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    // 团队最近一次打卡在起点且上个打卡点位为空/最近一次打卡点位为空
    ((teamInfoData.value.team.latest_point_name ===
      first(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
      !teamInfoData.value.team.prev_point_name) ||
      !teamInfoData.value.team.latest_point_name)
  )
);

/** 终点管理功能是否可用 */
const isEndPointManageAvailable = computed(() =>
  Boolean(
    teamInfoData.value &&
    // 当前管理员用户在团队所属路线的终点
    adminPointId.value === last(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    // 团队最近一次打卡在终点且上个打卡点位不为空
    teamInfoData.value.team.latest_point_name ===
      last(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    teamInfoData.value.team.prev_point_name
  )
);

/** 获取团队状态信息 */
const {
  data: teamInfoData,
  refetch: refetchTeamInfo,
  isLoading: isTeamInfoLoading,
  isFetching: isTeamInfoFetching,
  error: teamInfoError
} = useQuery({
  queryKey: [ADMIN_QUERY_KEY.TEAM.STATUS, teamId] as const,
  queryFn: () => walkAdminService.QueryTeamStatus({ team_id: teamId.value })
});

/** 是否正在下拉刷新中 */
const isPullRefreshing = ref(false);
// refetch结束时关闭下拉刷新态
watch(
  () => isTeamInfoFetching.value,
  (newValue) => {
    if (newValue === false) isPullRefreshing.value = false;
  },
  { immediate: true }
);

/** 下拉刷新 */
const handleRefresh = () => {
  // 展示下拉刷新态
  isPullRefreshing.value = true;

  refetchTeamInfo();
};

// 团队在最近的打卡中进入错误路线时，显示一次提示
watch(
  () => teamInfoData.value?.team.is_just_enter_wrong_route,
  (isJustEnterWrongRouteVal) => {
    if (isNil(teamInfoData.value)) return;
    if (!isWrongRouteAlertTriggered.value && isJustEnterWrongRouteVal) {
      isWrongRouteAlertTriggered.value = true;
      showDialog({
        title: "走错路线",
        message: "该团队走错路线，请及时提醒！"
      });
    }
  },
  { immediate: true }
);

// 更改成员行进状态
const { mutate: mutateUpdateMemberWalkStatus, isPending: isUpdateMemberWalkStatusPending } =
  useMutation({
    mutationFn: (params: { memberId: number; status: MemberWalkStatus }) =>
      walkAdminService.UpdateMemberWalkStatus({
        user_id: params.memberId,
        status: params.status
      }),
    onSuccess: (_data, params) => {
      showSuccessToast("设置成功");
      // 提前更新缓存
      queryClient.setQueryData<AdminAPI.QueryTeamStatusResponse>(
        [ADMIN_QUERY_KEY.TEAM.STATUS, teamId.value],
        (oldData) => {
          if (isNil(oldData)) return oldData;
          return {
            ...oldData,
            members: oldData.members.map((member) =>
              member.user_id === params.memberId
                ? { ...member, walk_status: params.status }
                : member
            )
          };
        }
      );
    },
    onError: (error) => {
      showFailToast(error.message || "设置失败");
    },
    onSettled: () => {
      // 刷新团队数据
      refetchTeamInfo();
    }
  });

// 更改成员违规状态
const { mutate: mutateUpdateMemberViolated, isPending: isUpdateMemberViolatedPending } =
  useMutation({
    mutationFn: (params: { memberId: number; isViolated: boolean }) =>
      walkAdminService.UpdateMemberViolated({
        user_id: params.memberId,
        is_violated: params.isViolated
      }),
    onSuccess: (_data, params) => {
      showSuccessToast("设置成功");
      // 提前更新缓存
      queryClient.setQueryData<AdminAPI.QueryTeamStatusResponse>(
        [ADMIN_QUERY_KEY.TEAM.STATUS, teamId.value],
        (oldData) => {
          if (isNil(oldData)) return oldData;
          return {
            ...oldData,
            members: oldData.members.map((member) =>
              member.user_id === params.memberId
                ? { ...member, is_violated: params.isViolated }
                : member
            )
          };
        }
      );
    },
    onError: (error) => {
      showFailToast(error.message || "设置失败");
    },
    onSettled: () => {
      // 刷新团队数据
      refetchTeamInfo();
    }
  });

// 标记团队违规
const { mutate: mutateMarkTeamViolated, isPending: isMarkTeamViolatedPending } = useMutation({
  mutationFn: () =>
    walkAdminService.MarkTeamViolated({
      team_id: teamId.value
    }),
  onSuccess: () => {
    showSuccessToast("已标记违规");
    // 提前更新缓存
    queryClient.setQueryData<AdminAPI.QueryTeamStatusResponse>(
      [ADMIN_QUERY_KEY.TEAM.STATUS, teamId.value],
      (oldData) => {
        if (isNil(oldData)) return oldData;
        return {
          ...oldData,
          members: oldData.members.map((member) => ({ ...member, is_violated: true }))
        };
      }
    );
  },
  onError: (error) => {
    showFailToast(error.message || "操作失败");
  },
  onSettled: () => {
    // 刷新团队数据
    refetchTeamInfo();
  }
});

// 绑定签到码
const { mutate: mutateBindCheckinCode, isPending: isBindCheckinCodePending } = useMutation({
  mutationFn: (params: { teamId: number; content: string }) =>
    walkAdminService.BindCheckinCode({
      team_id: params.teamId,
      content: params.content
    }),
  onSuccess: () => {
    showSuccessToast("绑定成功");
    refetchTeamInfo();
  },
  onError: (error) => {
    showFailToast(error.message || "绑定失败");
  }
});

// 终点确认
const { mutate: mutateConfirmDestination, isPending: isConfirmDestinationPending } = useMutation({
  mutationFn: () =>
    walkAdminService.ConfirmDestination({
      team_id: teamId.value
    }),
  onSuccess: () => {
    showSuccessToast("已确认");
    refetchTeamInfo();
  },
  onError: (error) => {
    showFailToast(error.message || "操作失败");
  }
});

/** 任意mutation请求中 */
const isAnyMutationPending = computed(
  () =>
    isUpdateMemberWalkStatusPending.value ||
    isUpdateMemberViolatedPending.value ||
    isBindCheckinCodePending.value ||
    isConfirmDestinationPending.value ||
    isMarkTeamViolatedPending.value
);
</script>
