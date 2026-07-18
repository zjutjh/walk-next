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

          <div :class="styles.buttonContainer">
            <van-button
              v-if="teamInfoData.team.is_prev_point_invalid"
              type="danger"
              block
              @click="handleMarkViolatedClick"
              >标记团队违规</van-button
            >
            <van-button
              v-if="isStartPointManageAvailable"
              type="primary"
              block
              @click="handleBindCheckinCodeClick"
              >绑定签到码</van-button
            >
            <van-button
              v-if="isEndPointManageAvailable"
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

  <!-- 成员操作弹层 -->
  <van-action-sheet
    v-model:show="isMemberActionSheetVisible"
    :class="styles.memberActionSheet"
    :actions="memberActionSheetActions"
    :description="memberActionSheetMember?.name"
    cancel-text="取消"
    close-on-click-action
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
import { find, first, isNil, last } from "lodash-es";
import { CellGroup, ErrorEmpty } from "shared";
import { is } from "valibot";
import { showConfirmDialog, showDialog, showFailToast, showSuccessToast } from "vant";
import type { ActionSheetAction } from "vant/es";
import { computed, ref, watch } from "vue";

import QrScanPopup from "@/components/qr-scan-popup/index.vue";
import { useAdminInfo } from "@/composables";
import {
  ADMIN_QUERY_KEY,
  MEMBER_WALK_STATUS_COLOR_MAP,
  MEMBER_WALK_STATUS_TEXT
} from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CheckinQrCodeSchema, walkAdminService } from "@/utils";
import { POINT_CONFIG, ROUTE_CONFIG, ROUTE_POINT_LIST_MAP } from "@/walk-config";

import styles from "./index.module.scss";

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

/** 获取团队状态信息 */
const {
  data: teamInfoData,
  refetch: refetchTeamData,
  isLoading: isTeamInfoLoading,
  isFetching: isTeamInfoFetching,
  error: teamInfoError
} = useQuery({
  queryKey: [ADMIN_QUERY_KEY.TEAM.STATUS, teamId] as const,
  queryFn: () => walkAdminService.QueryTeamStatus({ team_id: teamId.value })
});

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

/** 起点管理功能是否可用 */
const isStartPointManageAvailable = computed(
  () =>
    teamInfoData.value &&
    // 当前管理员用户在团队所属路线的起点
    adminPointId.value === first(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    // 团队最近一次打卡在起点且上个打卡点位为空/最近一次打卡点位为空
    ((teamInfoData.value.team.latest_point_name ===
      first(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
      !teamInfoData.value.team.prev_point_name) ||
      !teamInfoData.value.team.latest_point_name)
);

/** 终点管理功能是否可用 */
const isEndPointManageAvailable = computed(
  () =>
    teamInfoData.value &&
    // 当前管理员用户在团队所属路线的终点
    adminPointId.value === last(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    // 团队最近一次打卡在终点且上个打卡点位不为空
    teamInfoData.value.team.latest_point_name ===
      last(ROUTE_POINT_LIST_MAP[teamInfoData.value.team.route_name]) &&
    teamInfoData.value.team.prev_point_name
);

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

  refetchTeamData();
};

/** 团队剩余人数 */
const remainingCount = computed(
  () =>
    teamInfoData.value?.members.filter(
      (member) => member.walk_status !== "abandoned" && member.walk_status !== "withdrawn"
    ).length
);

/** 成员操作弹层当前操作的成员ID */
const memberActionSheetMemberId = ref<number>();
/** 成员操作弹层当前操作的成员 */
const memberActionSheetMember = computed(() =>
  find(teamInfoData.value?.members, (member) => member.user_id === memberActionSheetMemberId.value)
);
/** 成员操作弹层是否可见 */
const isMemberActionSheetVisible = ref(false);

/** 成员操作弹层的可用选项列表 */
const memberActionSheetActions = computed<ActionSheetAction[]>(() => {
  const availableStatusSet: Set<MemberWalkStatus> = new Set();

  // 用户为起点管理员，且起点相关功能适用于团队
  if (isStartPointManageAvailable.value) {
    availableStatusSet.add("not_start");
    availableStatusSet.add("pending");
  }

  // 任何情况下都可以选择进行中
  availableStatusSet.add("in_progress");

  // 用户为终点管理员，且终点相关功能适用于团队
  if (isEndPointManageAvailable.value) {
    availableStatusSet.add("completed");
  }

  // 团队上个打卡点位不为空，可选择已下撤
  if (teamInfoData.value?.team.prev_point_name) {
    availableStatusSet.add("withdrawn");
  }

  // 任何情况下都可以选择已放弃
  availableStatusSet.add("abandoned");

  /** 更改行进状态的选项列表 */
  const updateWalkStatusActions = Array.from(availableStatusSet).map(
    (status) =>
      ({
        name: MEMBER_WALK_STATUS_TEXT[status],
        disabled: status === memberActionSheetMember.value?.walk_status,
        icon: status === memberActionSheetMember.value?.walk_status ? "success" : undefined,
        color: MEMBER_WALK_STATUS_COLOR_MAP[status],
        callback: () => handleUpdateMemberWalkStatus(status)
      }) satisfies ActionSheetAction
  );

  /** 更改违规状态的选项 */
  const updateViolatedAction: ActionSheetAction = {
    name: memberActionSheetMember.value?.is_violated ? "取消标记违规" : "标记违规",
    icon: memberActionSheetMember.value?.is_violated ? "revoke" : "warning-o",
    color: memberActionSheetMember.value?.is_violated
      ? "var(--van-warning-color)"
      : "var(--van-danger-color)",
    callback: () => handleUpdateMemberViolated(!memberActionSheetMember.value?.is_violated)
  };

  return [...updateWalkStatusActions, updateViolatedAction];
});

/** 打开成员操作弹层 */
const openMemberActionSheet = (id: number) => {
  memberActionSheetMemberId.value = id;
  isMemberActionSheetVisible.value = true;
};

// 更改成员行进状态
const { mutate: mutateUpdateStatus, isPending: isUpdateStatusPending } = useMutation({
  mutationFn: (params: { targetId: number; status: MemberWalkStatus }) =>
    walkAdminService.UpdateMemberWalkStatus({
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

// 更改成员违规状态
const { mutate: mutateUpdateMemberViolated, isPending: isUpdateMemberViolatedPending } =
  useMutation({
    mutationFn: (params: { targetId: number; isViolated: boolean }) =>
      walkAdminService.UpdateMemberViolated({
        user_id: params.targetId,
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
              member.user_id === params.targetId
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
      refetchTeamData();
    }
  });

// 标记团队违规
const { mutate: mutateMarkViolation, isPending: isMarkViolationPending } = useMutation({
  mutationFn: () =>
    walkAdminService.MarkTeamViolation({
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
    refetchTeamData();
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
    refetchTeamData();
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
    refetchTeamData();
  },
  onError: (error) => {
    showFailToast(error.message || "操作失败");
  }
});

/** 更改成员行进状态 */
const handleUpdateMemberWalkStatus = (targetStatus: MemberWalkStatus) => {
  if (isNil(memberActionSheetMemberId.value)) return;
  mutateUpdateStatus({
    targetId: memberActionSheetMemberId.value,
    status: targetStatus
  });
};

/** 更改成员违规状态 */
const handleUpdateMemberViolated = (isViolated: boolean) => {
  if (isNil(memberActionSheetMemberId.value)) return;
  mutateUpdateMemberViolated({
    targetId: memberActionSheetMemberId.value,
    isViolated
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

/** 扫码成功 */
const handleScanSuccess = (data: unknown) => {
  if (!is(CheckinQrCodeSchema, data)) return;
  // 关闭扫码弹层
  isScanPopupVisible.value = false;
  mutateBindCheckinCode({
    teamId: teamId.value,
    content: data.code
  });
};

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

/** 任意mutation请求中 */
const isAnyMutationPending = computed(
  () =>
    isUpdateStatusPending.value ||
    isUpdateMemberViolatedPending.value ||
    isBindCheckinCodePending.value ||
    isConfirmDestinationPending.value ||
    isMarkViolationPending.value
);
</script>
