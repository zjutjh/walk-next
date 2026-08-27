<template>
  <div :class="styles.page">
    <error-empty
      :error="overviewError"
      :disabled="isOverviewLoading"
      @btn-click="handleOverviewRetry"
    >
      <van-loading v-if="isOverviewLoading" :class="styles.loading" vertical>加载中</van-loading>

      <template v-else-if="teamOverview">
        <team-overview-card :team="teamOverview.team" @detail="handleDetailClick" />

        <team-member-list :members="sortedMembers" @member-click="handleMemberClick" />

        <section v-if="isCaptain" :class="styles.actionArea">
          <van-button block round type="primary" @click="handleShareClick">分享队伍</van-button>
          <van-button
            block
            round
            type="danger"
            plain
            :loading="isDisbandTeamPending"
            @click="handleDisbandClick"
          >
            解散队伍
          </van-button>
          <van-button
            block
            round
            type="primary"
            :loading="isSubmitTeamPending || isUndoTeamSubmissionPending"
            :disabled="isTeamDetailLoading"
            @click="handleSubmissionClick"
          >
            {{ teamDetail?.submitted ? "取消提交" : "提交队伍" }}
          </van-button>
        </section>

        <section v-else-if="isLeaveTeamVisible" :class="styles.actionArea">
          <van-button
            block
            round
            type="danger"
            plain
            :loading="isLeaveTeamPending"
            @click="handleLeaveTeamClick"
          >
            退出队伍
          </van-button>
        </section>
      </template>

      <van-empty v-else description="暂无团队信息" />
    </error-empty>

    <team-member-detail-popup
      :opened="isMemberDetailPopupOpened"
      :member="selectedMemberDetail"
      :member-summary="selectedMemberSummary"
      :loading="isSelectedMemberDetailFetching"
      :error="selectedMemberDetailError"
      :can-manage-member="canManageSelectedMember"
      :action-loading="isMemberActionPending"
      @close="handleMemberPopupClose"
      @retry="handleSelectedMemberRetry"
      @remove="handleRemoveMemberClick"
      @transfer="handleTransferCaptainClick"
    />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type {
  DisbandTeamResponse,
  LeaveTeamResponse,
  QueryTeamDetailResponse,
  QueryTeamMemberResponse,
  QueryTeamOverviewResponse,
  RemoveTeamMemberResponse,
  SubmitTeamResponse,
  UndoTeamSubmissionResponse,
  UpdateTeamCaptainResponse
} from "api/types/client";
import { ErrorEmpty, RequestError, RESP_CODE } from "shared";
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import TeamMemberDetailPopup from "@/pages/team-detail/components/team-member-detail-popup/index.vue";
import TeamMemberList from "@/pages/team-detail/components/team-member-list/index.vue";
import TeamOverviewCard from "@/pages/team-detail/components/team-overview-card/index.vue";
import { walkClientService } from "@/utils";

import styles from "./index.module.scss";

const TEAM_SUBMIT_MIN_SIZE = 4;

const router = useRouter();
const queryClient = useQueryClient();
const { clientUserInfo, updateClientUserData } = useClientUserData();

const selectedMemberId = ref<number>();
const isMemberDetailPopupOpened = ref(false);

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const isMember = computed(() => clientUserInfo.value?.role === "member");

const isLeaveTeamVisible = computed(() => isMember.value && teamDetail.value?.submitted === false);

const {
  data: teamOverview,
  isLoading: isOverviewLoading,
  error: overviewError,
  refetch: refetchOverview
} = useQuery<QueryTeamOverviewResponse, Error>({
  queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW],
  queryFn: () => walkClientService.QueryTeamOverview(undefined)
});

const {
  data: teamDetail,
  isLoading: isTeamDetailLoading,
  refetch: refetchTeamDetail
} = useQuery<QueryTeamDetailResponse, Error>({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail(undefined)
});

const {
  data: selectedMemberDetail,
  isFetching: isSelectedMemberDetailFetching,
  error: selectedMemberDetailError,
  refetch: refetchSelectedMemberDetail
} = useQuery<QueryTeamMemberResponse, Error>({
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.MEMBER, selectedMemberId.value] as const),
  enabled: () => selectedMemberId.value !== undefined,
  queryFn: () => {
    const memberId = selectedMemberId.value;
    if (memberId === undefined) throw new Error("未选择队员");
    return walkClientService.QueryTeamMember({ id: memberId });
  }
});

const sortedMembers = computed(() => {
  const members = teamOverview.value?.members ?? [];

  return members
    .map((member, index) => ({ member, index }))
    .sort((left, right) => {
      if (left.member.role === right.member.role) return left.index - right.index;
      if (left.member.role === "captain") return -1;
      if (right.member.role === "captain") return 1;
      return left.index - right.index;
    })
    .map(({ member }) => member);
});

const selectedMemberSummary = computed(() =>
  sortedMembers.value.find((member) => member.id === selectedMemberId.value)
);

const canManageSelectedMember = computed(
  () => isCaptain.value && selectedMemberSummary.value?.role === "member"
);

const refreshTeamData = async () => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW]
    }),
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL] }),
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.MEMBER] })
  ]);
};

const refreshClientUserData = async () => {
  const userInfo = await queryClient.fetchQuery({
    queryKey: [CLIENT_QUERY_KEY.USER.SELF],
    queryFn: () => walkClientService.QueryUserInfo(undefined)
  });

  updateClientUserData({ userInfo });
};

const getSubmitErrorMessage = (error: Error) => {
  if (!(error instanceof RequestError)) return error.message || "提交失败，请稍后重试";

  switch (error.code) {
    case RESP_CODE.TEAM_NOT_ENOUGH:
      return "当前团队人数不足";
    case RESP_CODE.NOT_IN_REGISTER_TIME:
      return "未到提交时间";
    case RESP_CODE.USER_NO_QUOTA:
      return "当天名额已满";
    default:
      return error.message || "提交失败，请稍后重试";
  }
};

const showErrorToast = (message: string) => {
  showFailToast({
    message,
    duration: 3000,
    position: "top"
  });
};

const { mutate: mutateSubmitTeam, isPending: isSubmitTeamPending } = useMutation<
  SubmitTeamResponse,
  Error
>({
  mutationFn: () => walkClientService.SubmitTeam(undefined),
  onSuccess: async () => {
    showSuccessToast({
      message: "提交成功",
      duration: 3000,
      position: "top"
    });
    await refreshTeamData();
  },
  onError: (error) => {
    showErrorToast(getSubmitErrorMessage(error));
  }
});

const { mutate: mutateUndoTeamSubmission, isPending: isUndoTeamSubmissionPending } = useMutation<
  UndoTeamSubmissionResponse,
  Error
>({
  mutationFn: () => walkClientService.UndoTeamSubmission(undefined),
  onSuccess: async () => {
    showSuccessToast({
      message: "取消提交成功",
      duration: 3000,
      position: "top"
    });
    await refreshTeamData();
  },
  onError: (error) => {
    showErrorToast(error.message || "取消提交失败，请稍后重试");
  }
});

const { mutate: mutateDisbandTeam, isPending: isDisbandTeamPending } = useMutation<
  DisbandTeamResponse,
  Error
>({
  mutationFn: () => walkClientService.DisbandTeam(undefined),
  onSuccess: async () => {
    showSuccessToast({
      message: "解散成功",
      duration: 3000,
      position: "top"
    });
    await refreshClientUserData();
    await router.replace({ name: "team-info" });
  },
  onError: (error) => {
    showErrorToast(error.message || "解散失败，请稍后重试");
  }
});

const { mutate: mutateLeaveTeam, isPending: isLeaveTeamPending } = useMutation<
  LeaveTeamResponse,
  Error
>({
  mutationFn: () => walkClientService.LeaveTeam(undefined),
  onSuccess: async () => {
    showSuccessToast({ message: "退出成功", duration: 3000, position: "top" });
    await refreshClientUserData();
    await router.replace({ name: "team-info" });
  },
  onError: (error) => {
    showErrorToast(error.message || "退出失败，请稍后重试");
  }
});

const { mutate: mutateRemoveMember, isPending: isRemoveMemberPending } = useMutation<
  RemoveTeamMemberResponse,
  Error,
  number
>({
  mutationFn: (memberId) => walkClientService.RemoveTeamMember({ id: memberId }),
  onSuccess: async () => {
    showSuccessToast({
      message: "删除成功",
      duration: 3000,
      position: "top"
    });
    handleMemberPopupClose();
    await refreshTeamData();
  },
  onError: (error) => {
    showErrorToast(error.message || "删除失败，请稍后重试");
  }
});

const { mutate: mutateTransferCaptain, isPending: isTransferCaptainPending } = useMutation<
  UpdateTeamCaptainResponse,
  Error,
  number
>({
  mutationFn: (memberId) => walkClientService.UpdateTeamCaptain({ id: memberId }),
  onSuccess: async () => {
    showSuccessToast({
      message: "移交成功",
      duration: 3000,
      position: "top"
    });
    handleMemberPopupClose();
    await Promise.all([refreshTeamData(), refreshClientUserData()]);
  },
  onError: (error) => {
    showErrorToast(error.message || "移交失败，请稍后重试");
  }
});

const isMemberActionPending = computed(
  () => isRemoveMemberPending.value || isTransferCaptainPending.value
);

const handleOverviewRetry = () => {
  void refetchOverview();
  void refetchTeamDetail();
};

const handleSelectedMemberRetry = () => {
  void refetchSelectedMemberDetail();
};

const handleDetailClick = () => {
  void router.replace({ name: "team-detail" });
};

const handleMemberClick = (memberId: number) => {
  selectedMemberId.value = memberId;
  isMemberDetailPopupOpened.value = true;
};

const handleMemberPopupClose = () => {
  isMemberDetailPopupOpened.value = false;
  selectedMemberId.value = undefined;
};

const handleRemoveMemberClick = async (memberId: number) => {
  try {
    await showConfirmDialog({
      title: "删除队员",
      message: "确认将该队员移出队伍吗？"
    });
  } catch {
    return;
  }

  mutateRemoveMember(memberId);
};

const handleTransferCaptainClick = async (memberId: number) => {
  try {
    await showConfirmDialog({
      title: "移交队长",
      message: "确认将队长移交给该队员吗？移交后你将变为队员。"
    });
  } catch {
    return;
  }

  mutateTransferCaptain(memberId);
};

const handleShareClick = () => {
  showToast({ message: "分享队伍功能将在二期开放", position: "bottom" });
};

const handleDisbandClick = async () => {
  try {
    await showConfirmDialog({
      title: "解散队伍",
      message: "确认解散当前队伍吗？解散后所有队员都需要重新加入队伍。"
    });
  } catch {
    return;
  }

  mutateDisbandTeam();
};

const handleLeaveTeamClick = async () => {
  try {
    await showConfirmDialog({
      title: "退出队伍",
      message: "确认退出当前队伍吗？退出后需要重新加入队伍。"
    });
  } catch {
    return;
  }

  mutateLeaveTeam();
};

const handleSubmissionClick = async () => {
  if (!teamDetail.value) {
    showErrorToast("团队详细信息加载中");
    return;
  }

  if (teamDetail.value.submitted) {
    try {
      await showConfirmDialog({
        title: "取消提交",
        message: "确认取消当前队伍提交状态吗？"
      });
    } catch {
      return;
    }

    mutateUndoTeamSubmission();
    return;
  }

  if (sortedMembers.value.length < TEAM_SUBMIT_MIN_SIZE) {
    showErrorToast("当前团队人数不足");
    return;
  }

  mutateSubmitTeam();
};
</script>
