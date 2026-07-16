<!-- 团队信息页 -->
<template>
  <default-layout
    :class="styles.page"
    :title="teamInfoData?.team.name || undefined"
    :back-disabled="isAnyMutationPending"
    :loading="isTeamInfoLoading || isAnyMutationPending"
  >
    <error-empty :error="teamInfoError" :disabled="isTeamInfoFetching">
      <van-pull-refresh
        v-if="teamInfoData"
        :model-value="isPullRefreshing"
        :disabled="isTeamInfoFetching"
        @refresh="handleRefresh"
      >
        <div :class="styles.contentContainer">
          <van-cell-group v-if="teamInfoData" :class="styles.overviewCard" inset>
            <van-cell title="团队路线">
              <van-tag
                :class="styles.cellValueTag"
                :show="teamInfoData.team.is_wrong_route"
                type="warning"
                size="large"
                >走错</van-tag
              >
              {{ ROUTE_CONFIG[teamInfoData.team.route_name]?.text }}</van-cell
            >
            <van-cell title="团队剩余人数">
              {{ remainingCount ?? "-" }}
            </van-cell>
            <van-cell title="上次打卡点位">
              <van-tag
                :class="styles.cellValueTag"
                :show="teamInfoData.team.is_prev_point_invalid"
                type="danger"
                size="large"
                >异常</van-tag
              >
              {{ POINT_CONFIG[teamInfoData.team.prev_point_name]?.text ?? "-" }}
            </van-cell>
          </van-cell-group>

          <cell-group :loading="isTeamInfoFetching" title="成员状态" inset>
            <van-cell
              v-for="member in teamInfoData.members"
              :key="member.user_id"
              :title="member.name"
              is-link
              @click="openStatusPicker(member.user_id)"
            >
              <span :style="{ color: MEMBER_STATUS_COLOR_MAP[member.walk_status] }">{{
                WALKER_STATUS_TEXT[member.walk_status]
              }}</span>
            </van-cell>
          </cell-group>

          <div :class="styles.middleWhiteSpace"></div>

          <div :class="styles.buttonContainer">
            <van-button
              v-if="teamInfoData.team.is_prev_point_invalid"
              type="danger"
              block
              @click="handleMarkViolatedClick"
              >标记团队违规</van-button
            >
            <van-button
              v-if="isAdminAtStartPoint && isTeamMaybeNotStart"
              type="primary"
              block
              @click="handleBindCheckinCodeClick"
              >绑定签到码</van-button
            >
            <van-button
              v-if="isAdminAtEndPoint && teamInfoData.team.status === 'in_progress'"
              type="primary"
              block
              @click="handleConfirmDestinationClick"
              >确认到达终点</van-button
            >
          </div>
        </div>
      </van-pull-refresh>
    </error-empty>
  </default-layout>

  <!-- 成员状态编辑弹层 -->
  <van-action-sheet
    v-model:show="isStatusPickerVisible"
    :actions="statusPickerActions"
    cancel-text="取消"
    close-on-click-action
    @select="handleSelectStatus"
  />

  <!-- 扫码弹窗 -->
  <qr-scan-popup
    v-model:show="isScanPopupVisible"
    :schema="CheckinQrCodeSchema"
    @success="handleScanSuccess"
  />
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { AdminAPI, MemberWalkStatus } from "api/types/admin";
import { first, isNil, last } from "lodash-es";
import { CellGroup, ErrorEmpty } from "shared";
import { is } from "valibot";
import { showConfirmDialog, showDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref, watch, watchEffect } from "vue";

import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { useAdminInfo } from "@/composables";
import { ADMIN_QUERY_KEY, MEMBER_STATUS_COLOR_MAP, WALKER_STATUS_TEXT } from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CheckinQrCodeSchema, walkAdminService } from "@/utils";
import { POINT_CONFIG, ROUTE_CONFIG, ROUTE_POINT_LIST_MAP } from "@/walk-config";

import { STATUS_PICKER_ACTION_MAP } from "./constants";
import styles from "./index.module.scss";
import type { StatusPickerAction } from "./types";

const props = defineProps<{
  /** Path Param传入的团队ID */
  teamIdParam: string;
}>();
/** 团队ID */
const teamId = computed(() => Number(props.teamIdParam));

const queryClient = useQueryClient();
const { adminPointId } = useAdminInfo();

/** 是否已经弹出过走错路线提示 */
const isWrongRouteAlertTriggered = ref(false);
/** 本次进入页面后，是否出现过未开始/待出发成员 */
const isPendingOrNotStartMemberEverAppeared = ref(false);

/** 获取团队状态信息 */
const {
  data: teamInfoData,
  refetch: refetchTeamData,
  isLoading: isTeamInfoLoading,
  isFetching: isTeamInfoFetching,
  error: teamInfoError,
  dataUpdatedAt: teamInfoDataUpdatedAt
} = useQuery({
  queryKey: [ADMIN_QUERY_KEY.TEAM.STATUS, teamId] as const,
  queryFn: () => walkAdminService.QueryTeamStatus({ team_id: teamId.value })
});

// 数据更新监听器
watch(
  teamInfoDataUpdatedAt,
  () => {
    if (isNil(teamInfoData.value)) return;
    // 团队在最近的打卡中进入错误路线，显示一次提示
    if (!isWrongRouteAlertTriggered.value && teamInfoData.value.team.is_just_enter_wrong_route) {
      isWrongRouteAlertTriggered.value = true;
      showDialog({
        title: "走错路线",
        message: "该团队走错路线，请及时提醒！"
      });
    }
    // 检查是否出现了未开始或待出发成员
    if (!isPendingOrNotStartMemberEverAppeared.value) {
      isPendingOrNotStartMemberEverAppeared.value = teamInfoData.value.members.some(
        (member) => member.walk_status === "not_start" || member.walk_status === "pending"
      );
    }
  },
  { immediate: true }
);

/** 是否认为团队可能尚未真正出发 */
const isTeamMaybeNotStart = computed(
  () =>
    // 团队上一打卡点位为空 或 进入页面后出现过未开始与待出发成员
    !teamInfoData.value?.team.prev_point_name || isPendingOrNotStartMemberEverAppeared.value
);

/** 是否正在下拉刷新中 */
const isPullRefreshing = ref(false);
// refetch结束时关闭下拉刷新态
watchEffect(() => {
  if (isTeamInfoFetching.value === false) isPullRefreshing.value = false;
});

/** 下拉刷新 */
const handleRefresh = () => {
  // 展示下拉刷新态
  isPullRefreshing.value = true;

  refetchTeamData();
};

/** 剩余人数 */
const remainingCount = computed(
  () =>
    teamInfoData.value?.members.filter((member) => {
      switch (member.walk_status) {
        case "abandoned":
        case "withdrawn":
          return false;
        default:
          return true;
      }
    }).length
);

/** 当前管理员用户是否在团队所属路线的起点 */
const isAdminAtStartPoint = computed(
  () =>
    adminPointId.value === first(ROUTE_POINT_LIST_MAP[teamInfoData.value?.team.route_name ?? ""])
);
/** 当前管理员用户是否在团队所属路线的终点 */
const isAdminAtEndPoint = computed(
  () => adminPointId.value === last(ROUTE_POINT_LIST_MAP[teamInfoData.value?.team.route_name ?? ""])
);

/** 成员状态编辑弹层是否可见 */
const isStatusPickerVisible = ref(false);

/** 成员状态编辑弹层的可用选项列表 */
const statusPickerActions = computed<StatusPickerAction[]>(() => {
  const availableStatusSet: Set<MemberWalkStatus> = new Set();

  // 用户为起点管理员，且团队可能尚未真正出发，可选择未开始、待出发
  if (isAdminAtStartPoint.value && isTeamMaybeNotStart.value) {
    availableStatusSet.add("not_start");
    availableStatusSet.add("pending");
  }

  // 任何情况下都可以选择进行中
  availableStatusSet.add("in_progress");

  // 用户为终点管理员，且团队上一打卡点位不为空，可选择已完成
  if (isAdminAtEndPoint.value && teamInfoData.value?.team.prev_point_name) {
    availableStatusSet.add("completed");
  }

  // 团队上一打卡点位不为空，可选择已下撤、已违规
  if (teamInfoData.value?.team.prev_point_name) {
    availableStatusSet.add("withdrawn");
    availableStatusSet.add("violated");
  }

  // 任何情况下都可以选择已放弃
  availableStatusSet.add("abandoned");

  return Array.from(availableStatusSet).map((status) => STATUS_PICKER_ACTION_MAP[status]);
});

/** 成员状态编辑弹层针对的成员的ID */
const statusPickerWalkerId = ref<number>();

/** 打开成员状态编辑弹层 */
const openStatusPicker = (id: number) => {
  statusPickerWalkerId.value = id;
  isStatusPickerVisible.value = true;
};

// 更改成员状态
const { mutate: mutateUpdateStatus, isPending: isUpdateStatusPending } = useMutation({
  mutationFn: (params: { targetId: number; status: MemberWalkStatus }) =>
    walkAdminService.UpdateWalkerStatus({
      user_id: params.targetId,
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
            member.user_id === params.targetId ? { ...member, walk_status: params.status } : member
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
    refetchTeamData();
  }
});

/** 编辑成员状态 */
const handleSelectStatus = (action: StatusPickerAction) => {
  if (isNil(statusPickerWalkerId.value)) return;
  mutateUpdateStatus({
    targetId: statusPickerWalkerId.value,
    status: action.status
  });
};

/** 点击标记团队违规 */
const handleMarkViolatedClick = async () => {
  try {
    await showConfirmDialog({
      title: "团队违规",
      message: "确定将团队所有成员标记为已违规？",
      confirmButtonColor: "danger"
    });
  } catch {
    return;
  }
  mutateMarkViolation();
};

/** 扫码弹窗是否可见 */
const isScanPopupVisible = ref(false);

/** 点击绑定签到码 */
const handleBindCheckinCodeClick = () => {
  isScanPopupVisible.value = true;
};

// 绑定签到码
const { mutate: mutateBindCheckinCode, isPending: isBindCheckinCodePending } = useMutation({
  mutationFn: (params: { teamId: number; content: string }) =>
    walkAdminService.BindCheckinCode({
      team_id: params.teamId,
      content: params.content
    }),
  onSuccess: () => {
    showSuccessToast("绑定成功");
    refetchTeamData();
  },
  onError: (error) => {
    showFailToast(error.message || "绑定失败");
  }
});

/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (!is(CheckinQrCodeSchema, data)) return;
  isScanPopupVisible.value = false;
  mutateBindCheckinCode({
    teamId: teamId.value,
    content: data.code
  });
};

// 终点确认
const { mutate: mutateConfirmDestination, isPending: isConfirmDestinationPending } = useMutation({
  mutationFn: () =>
    walkAdminService.ConfirmDestination({
      team_id: teamId.value
    }),
  onSuccess: () => {
    showSuccessToast("已确认");
    refetchTeamData();
  },
  onError: (error) => {
    showFailToast(error.message || "操作失败");
  }
});

/** 点击确认到达终点 */
const handleConfirmDestinationClick = async () => {
  try {
    await showConfirmDialog({
      message: "团队已完成毅行？"
    });
  } catch {
    return;
  }
  mutateConfirmDestination();
};

// 标记团队违规
const { mutate: mutateMarkViolation, isPending: isMarkViolationPending } = useMutation({
  mutationFn: () =>
    walkAdminService.MarkTeamViolation({
      team_id: teamId.value
    }),
  onSuccess: () => {
    showSuccessToast("已标记违规");
    refetchTeamData();
  },
  onError: (error) => {
    showFailToast(error.message || "操作失败");
  }
});

/** 任意mutation请求中 */
const isAnyMutationPending = computed(
  () =>
    isUpdateStatusPending.value ||
    isBindCheckinCodePending.value ||
    isConfirmDestinationPending.value ||
    isMarkViolationPending.value
);
</script>
