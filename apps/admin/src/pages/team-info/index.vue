<template>
  <!-- 团队信息页 -->
  <loading-container
    :class="styles.page"
    :loading="isTeamInfoLoading || isAnyMutationPending"
    :modal="isAnyMutationPending"
  >
    <default-layout :title="teamInfoData?.team.name">
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

            <van-cell-group title="成员状态" inset>
              <van-cell
                v-for="member in teamInfoData.members"
                :key="member.user_id"
                :title="member.name"
                is-link
                @click="openStatusPicker(member.user_id)"
              >
                <span :style="{ color: STATUS_COLOR_MAP[member.walk_status] }">{{
                  WALKER_STATUS_TEXT[member.walk_status]
                }}</span>
              </van-cell>
            </van-cell-group>

            <div :class="styles.buttonContainer">
              <van-button
                v-if="teamInfoData.team.is_prev_point_invalid"
                type="danger"
                block
                @click="handleMarkViolatedClick"
                >标记团队违规</van-button
              >
              <van-button
                v-if="isAdminAtStartPoint && !teamInfoData.team.prev_point_name"
                type="primary"
                block
                @click="handleBindCheckinCodeClick"
                >绑定纸质签到码</van-button
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

    <!-- 成员状态编辑弹窗 -->
    <van-action-sheet
      v-model:show="isStatusPickerVisible"
      :actions="statusPickerActions"
      cancel-text="取消"
      close-on-click-action
      @select="handleSelectStatus"
    />

    <!-- 扫码弹窗 -->
    <qr-scan-preview
      v-model:show="isScanPopupVisible"
      @success="handleScanSuccess"
      @error="handleScanError"
    />
  </loading-container>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import { QR_CODE, type WalkerStatus } from "api/types/admin";
import { first, isNil, last } from "lodash-es";
import { showConfirmDialog, showDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref, watch } from "vue";

import ErrorEmpty from "@/components/error-empty/index.vue";
import LoadingContainer from "@/components/loading-container/index.vue";
import type { QrCodeData } from "@/composables/use-qr-scanner";
import { WALKER_STATUS_TEXT } from "@/constants/enum-text";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { useAuthStore } from "@/stores/auth";
import { walkAdminService } from "@/utils/service";
import { POINT_CONFIG, ROUTE_CONFIG, ROUTE_POINT_LIST_MAP } from "@/walk-config";

import { STATUS_COLOR_MAP, STATUS_PICKER_ACTION_MAP } from "./constants";
import styles from "./index.module.scss";
import type { StatusPickerAction } from "./types";

const props = defineProps<{
  /** 团队ID字符串 */
  teamIdStr: string;
}>();
/** 团队ID */
const teamId = computed(() => Number(props.teamIdStr));

const authStore = useAuthStore();

/** 是否已经弹出过走错路线提示 */
const isWrongRouteAlertTriggered = ref(false);

/** 获取团队状态信息 */
const {
  data: teamInfoData,
  refetch: refetchTeamData,
  isLoading: isTeamInfoLoading,
  isFetching: isTeamInfoFetching,
  error: teamInfoError,
  dataUpdatedAt: teamInfoDataUpdatedAt
} = useQuery({
  queryKey: ["teamManage", teamId] as const,
  queryFn: () => walkAdminService.QueryTeamStatus({ team_id: teamId.value })
});

// 数据更新监听器
watch(teamInfoDataUpdatedAt, () => {
  // 团队在最近的打卡中进入错误路线，显示一次提示
  if (!isWrongRouteAlertTriggered.value && teamInfoData.value?.team.is_just_enter_wrong_route) {
    isWrongRouteAlertTriggered.value = true;
    showDialog({
      title: "走错路线",
      message: "该团队走错路线，请及时提醒！"
    });
  }
});

/** 是否正在下拉刷新中 */
const isPullRefreshing = ref(false);
// refetch结束时关闭下拉刷新态
watch(isTeamInfoFetching, (newValue) => {
  if (newValue === false) isPullRefreshing.value = false;
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
  () => authStore.pointId === first(ROUTE_POINT_LIST_MAP[teamInfoData.value?.team.route_name ?? ""])
);
/** 当前管理员用户是否在团队所属路线的终点 */
const isAdminAtEndPoint = computed(
  () => authStore.pointId === last(ROUTE_POINT_LIST_MAP[teamInfoData.value?.team.route_name ?? ""])
);

/** 成员状态编辑弹层是否可见 */
const isStatusPickerVisible = ref(false);

/** 成员状态编辑弹层的可用选项列表 */
const statusPickerActions = computed<StatusPickerAction[]>(() => {
  const availableStatusSet: Set<WalkerStatus> = new Set();

  // 用户为起点管理员，且团队上一打卡点位为空，可选择未开始、待出发
  if (isAdminAtStartPoint.value && !teamInfoData.value?.team.prev_point_name) {
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
  mutationFn: (params: { targetId: number; status: WalkerStatus }) =>
    walkAdminService.UpdateWalkerStatus({
      user_id: params.targetId,
      status: params.status
    }),
  onSuccess: () => {
    showSuccessToast("设置成功");
    refetchTeamData();
  },
  onError: (error) => {
    showFailToast(error.message || "设置失败");
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

/** 点击绑定纸质签到码 */
const handleBindCheckinCodeClick = () => {
  isScanPopupVisible.value = true;
};

// 绑定纸质签到码
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
    isScanPopupVisible.value = true;
  }
});

/** 扫码成功 */
const handleScanSuccess = (data: QrCodeData) => {
  if (data.code_type !== QR_CODE.Checkin) {
    showFailToast("请扫纸质签到码");
    return;
  }
  isScanPopupVisible.value = false;
  mutateBindCheckinCode({
    teamId: teamId.value,
    content: data.content
  });
};

/** 扫码失败 */
const handleScanError = (message: string) => {
  showFailToast(message || "扫码失败");
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
const handleConfirmDestinationClick = () => {
  showConfirmDialog({
    message: "团队已完成毅行？"
  }).then(() => {
    mutateConfirmDestination();
  });
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
