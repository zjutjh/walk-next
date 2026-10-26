<template>
  <div :class="styles.page">
    <query-state-container
      :error="overviewError"
      :loading="isOverviewLoading"
      :data="teamOverview"
      :btn-text="t('刷新')"
      :loading-text="t('refresh.loading')"
      :empty-description="t('暂无团队信息')"
      @retry="reload"
    >
      <template v-if="teamOverview">
        <team-pass-code
          v-if="teamDetail"
          :team-id="teamDetail.id"
          :submitted="teamDetail.submitted"
        />

        <team-overview-card :team="teamOverview.team" @detail="handleDetailClick" />

        <team-member-list :members="sortedMembers" @member-click="handleMemberClick" />

        <section v-if="isCaptain" :class="styles.actionArea">
          <van-button
            block
            round
            type="primary"
            plain
            :disabled="!teamDetail"
            @click="isShareSheetShow = true"
          >
            {{ t("分享队伍") }}
          </van-button>
          <van-button
            block
            round
            type="danger"
            plain
            :loading="isDisbandTeamPending"
            @click="handleDisbandClick"
          >
            {{ t("解散队伍") }}
          </van-button>
          <van-button
            block
            round
            type="primary"
            plain
            :loading="isSubmitTeamPending || isUndoTeamSubmissionPending"
            :disabled="isTeamDetailLoading"
            @click="handleSubmissionClick"
          >
            {{ teamDetail?.submitted ? t("取消提交") : t("提交队伍") }}
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
            {{ t("退出队伍") }}
          </van-button>
        </section>
      </template>
    </query-state-container>

    <team-member-detail-popup
      :opened="isMemberDetailPopupOpened"
      :member="selectedMemberDetail"
      :member-summary="selectedMemberSummary"
      :loading="isMemberDetailOverlayVisible"
      :error="selectedMemberDetailError"
      :can-manage-member="canManageSelectedMember"
      :action-loading="isMemberActionPending"
      @close="handleMemberPopupClose"
      @after-close="selectedMemberId = undefined"
      @retry="handleSelectedMemberRetry"
      @remove="handleRemoveMemberClick"
      @transfer="handleTransferCaptainClick"
    />

    <van-share-sheet
      v-model:show="isShareSheetShow"
      :title="t('分享队伍')"
      :options="shareOptions"
      @select="handleShareOperation"
    >
      <template #description>
        {{ t("邀请链接与二维码会在修改密码后失效，已加入的队员不受影响") }}
      </template>
    </van-share-sheet>

    <invite-preview
      v-if="teamDetail"
      :opened="isShareSheetShow"
      :team-id="teamDetail.id"
      :password="teamDetail.password"
    />

    <van-popup v-model:show="isQrPopupShow" round :class="styles.qrPopup">
      <qr-code :value="shareData.url" :class="styles.qrCode" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useClipboard, useEventListener, useShare, useTimeoutFn } from "@vueuse/core";
import { QueryStateContainer, RequestError, RESP_CODE } from "shared";
import { type ShareSheetOption, showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import QrCode from "@/components/qr-code/index.vue";
import TeamMemberDetailPopup from "@/components/team/team-member-detail-popup/index.vue";
import TeamMemberList from "@/components/team/team-member-list/index.vue";
import TeamOverviewCard from "@/components/team/team-overview-card/index.vue";
import { sortMembersByCaptain } from "@/components/team/utils";
import { useClientUserData, useTeamRoleSync } from "@/composables";
import {
  CLIENT_QUERY_KEY,
  TEAM_INVITE_CARD_TITLE_KEY,
  TEAM_INVITE_DESCRIPTION,
  TEAM_INVITE_LINK_CARD_SUMMARY,
  TEAM_INVITE_MESSAGE_KEYS
} from "@/constants";
import InvitePreview from "@/pages/team-info/components/invite-preview/index.vue";
import TeamPassCode from "@/pages/team-info/components/team-pass-code/index.vue";
import { confirmAction, getErrorMessage, pickRandom, walkClientService } from "@/utils";

import styles from "./index.module.scss";

// #region 队伍与队员数据
const TEAM_SUBMIT_MIN_SIZE = 4;

const router = useRouter();
const { t } = useI18n();
const queryClient = useQueryClient();
const { clientUserInfo, refreshUserInfo } = useClientUserData();

/** 提前清空会让弹层在关闭动画途中闪出空态，只在 after-close 后置空 */
const selectedMemberId = ref<number>();
const isMemberDetailPopupOpened = ref(false);

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const isMember = computed(() => clientUserInfo.value?.role === "member");

/** 暂时无条件展示，原附加条件为 teamDetail.submitted === false */
const isLeaveTeamVisible = computed(() => isMember.value);

const {
  data: teamOverview,
  isLoading: isOverviewLoading,
  error: overviewError
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW],
  queryFn: () => walkClientService.QueryTeamOverview()
});

const { data: teamDetail, isLoading: isTeamDetailLoading } = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL],
  queryFn: () => walkClientService.QueryTeamDetail()
});

useTeamRoleSync(teamOverview);

const {
  data: selectedMemberDetail,
  isFetching: isSelectedMemberDetailFetching,
  error: selectedMemberDetailError,
  refetch: refetchSelectedMemberDetail
} = useQuery({
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.MEMBER, selectedMemberId.value] as const),
  enabled: () => selectedMemberId.value !== undefined,
  queryFn: () => {
    const memberId = selectedMemberId.value;
    if (memberId === undefined) throw new Error(t("未选择队员"));
    return walkClientService.QueryTeamMember({ id: memberId });
  }
});

const sortedMembers = computed(() => sortMembersByCaptain(teamOverview.value?.members ?? []));

const selectedMemberSummary = computed(() =>
  sortedMembers.value.find((member) => member.id === selectedMemberId.value)
);

const canManageSelectedMember = computed(
  () => isCaptain.value && selectedMemberSummary.value?.role === "member"
);

const isMemberDetailOverlayVisible = computed(
  () => isSelectedMemberDetailFetching.value && !selectedMemberDetail.value
);
// #endregion

// #region 数据刷新与提示
const refreshTeamData = async () => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [CLIENT_QUERY_KEY.TEAM.OVERVIEW]
    }),
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.DETAIL] }),
    queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY.TEAM.MEMBER] })
  ]);
};

const getSubmitErrorMessage = (error: Error) => {
  if (!(error instanceof RequestError)) return getErrorMessage(error, t("提交失败，请稍后重试"));

  switch (error.code) {
    case RESP_CODE.TEAM_NOT_ENOUGH:
      return t("当前团队人数不足");
    case RESP_CODE.NOT_IN_REGISTER_TIME:
      return t("未到提交时间");
    case RESP_CODE.USER_NO_QUOTA:
      return t("当天名额已满");
    default:
      return getErrorMessage(error, t("提交失败，请稍后重试"));
  }
};

const showErrorToast = (message: string) => {
  showFailToast({ message });
};
// #endregion

// #region 队伍操作
const { mutate: mutateSubmitTeam, isPending: isSubmitTeamPending } = useMutation({
  mutationFn: () => walkClientService.SubmitTeam(),
  onSuccess: async () => {
    showSuccessToast({ message: t("提交成功") });
    await refreshTeamData();
  },
  onError: (error) => {
    showErrorToast(getSubmitErrorMessage(error));
  }
});

const { mutateAsync: mutateUndoTeamSubmission, isPending: isUndoTeamSubmissionPending } =
  useMutation({
    mutationFn: () => walkClientService.UndoTeamSubmission(),
    onError: (error) => {
      showErrorToast(getErrorMessage(error, t("取消提交失败，请稍后重试")));
    }
  });

const { mutateAsync: mutateDisbandTeam, isPending: isDisbandTeamPending } = useMutation({
  mutationFn: () => walkClientService.DisbandTeam(),
  onError: (error) => {
    showErrorToast(getErrorMessage(error, t("解散失败，请稍后重试")));
  }
});

const { mutateAsync: mutateLeaveTeam, isPending: isLeaveTeamPending } = useMutation({
  mutationFn: () => walkClientService.LeaveTeam(),
  onError: (error) => {
    showErrorToast(getErrorMessage(error, t("退出失败，请稍后重试")));
  }
});

const { mutateAsync: mutateRemoveMember, isPending: isRemoveMemberPending } = useMutation({
  mutationFn: (memberId: number) => walkClientService.RemoveTeamMember({ id: memberId }),
  onError: (error) => {
    showErrorToast(getErrorMessage(error, t("移出失败，请稍后重试")));
  }
});

const { mutateAsync: mutateTransferCaptain, isPending: isTransferCaptainPending } = useMutation({
  mutationFn: (memberId: number) => walkClientService.UpdateTeamCaptain({ id: memberId }),
  onError: (error) => {
    showErrorToast(getErrorMessage(error, t("移交失败，请稍后重试")));
  }
});

const isMemberActionPending = computed(
  () => isRemoveMemberPending.value || isTransferCaptainPending.value
);
// #endregion

// #region 事件处理
const reload = () => {
  location.reload();
};

const handleSelectedMemberRetry = () => {
  void refetchSelectedMemberDetail();
};

const handleDetailClick = () => {
  void router.push({ name: "team-detail" });
};

const handleMemberClick = (memberId: number) => {
  selectedMemberId.value = memberId;
  isMemberDetailPopupOpened.value = true;
};

const handleMemberPopupClose = () => {
  isMemberDetailPopupOpened.value = false;
};

const handleRemoveMemberClick = (memberId: number) => {
  void confirmAction({
    title: t("移出团队"),
    message: t("确认将该队员移出团队吗？"),
    action: () => mutateRemoveMember(memberId),
    onSuccess: async () => {
      handleMemberPopupClose();
      showSuccessToast({ message: t("移出成功") });
      await refreshTeamData();
    }
  });
};

const handleTransferCaptainClick = (memberId: number) => {
  void confirmAction({
    title: t("移交队长"),
    message: t("确认将队长移交给该队员吗？移交后你将变为队员。"),
    action: () => mutateTransferCaptain(memberId),
    onSuccess: async () => {
      handleMemberPopupClose();
      showSuccessToast({ message: t("移交成功") });
      await refreshTeamData();
    }
  });
};

// 分享所需的链接与图片数据
const isShareSheetShow = ref(false);
const isQrPopupShow = ref(false);

const shareData = computed(() => {
  let url = "";
  if (teamDetail.value) {
    const { id, password } = teamDetail.value;
    url = new URL(
      router.resolve({
        name: "team-invite-join",
        // eslint-disable-next-line camelcase
        query: { team_id: String(id), password: btoa(encodeURIComponent(password)) }
      }).href,
      window.location.origin
    ).toString();
  }
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);

  return {
    url,
    image: new URL("logo.png", baseUrl).toString(),
    title: t(TEAM_INVITE_CARD_TITLE_KEY, { name: teamDetail.value?.name ?? "" }),
    text: TEAM_INVITE_LINK_CARD_SUMMARY,
    desc: pickRandom(TEAM_INVITE_DESCRIPTION)
  };
});

const { copy } = useClipboard({ legacy: true });
const share = useShare(
  computed(() => ({
    title: t("分享团队"),
    text: shareData.value.title,
    url: shareData.value.url
  }))
);

const { start: startQqShareTimer, stop: stopQqShareTimer } = useTimeoutFn(
  () => {
    const fallbackUrl = new URL("https://connect.qq.com/widget/shareqq/");
    fallbackUrl.searchParams.set("url", shareData.value.url);
    fallbackUrl.searchParams.set("title", shareData.value.title);
    fallbackUrl.searchParams.set("summary", shareData.value.text);
    fallbackUrl.searchParams.set("pics", shareData.value.image);
    fallbackUrl.searchParams.set("desc", shareData.value.desc);
    window.open(fallbackUrl.toString());
  },
  1500,
  { immediate: false }
);

useEventListener(document, "visibilitychange", () => {
  if (document.hidden) stopQqShareTimer();
});

const shareOptions = computed<ShareSheetOption[][]>(() => [
  [
    { name: t("QQ"), icon: "qq" },
    { name: t("QQ 空间"), icon: "star-o" },
    { name: t("微博"), icon: "weibo" }
  ],
  [
    { name: t("二维码"), icon: "qr" },
    ...(share.isSupported.value ? [{ name: t("系统分享"), icon: "share-o" }] : []),
    { name: t("复制链接"), icon: "link-o" }
  ]
]);

const handleShareOperation = async (option: ShareSheetOption) => {
  if (teamDetail.value) {
    isShareSheetShow.value = false;
    switch (option.icon) {
      case "qq":
        {
          // 唤起客户端: mqqapi://share/to_fri?src_type=web&version=1&file_type=news&title=标题&url=链接&image_url=图片
          // 网页分享: https://connect.qq.com/widget/shareqq/?url=链接&title=标题&desc=描述&summary=摘要&pics=图片
          const mqqUrl =
            `mqqapi://share/to_fri?src_type=web&version=1&file_type=news` +
            `&title=${encodeURIComponent(shareData.value.title)}` +
            `&url=${encodeURIComponent(shareData.value.url)}` +
            `&image_url=${encodeURIComponent(shareData.value.image)}`;

          startQqShareTimer();
          window.location.href = mqqUrl;
        }
        break;
      case "star-o":
        {
          // QQ空间: https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=链接&title=标题&desc=描述&summary=摘要&site=来源&pics=图片
          const qzoneShareUrl = new URL(
            "https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey"
          );
          qzoneShareUrl.searchParams.set("url", shareData.value.url);
          qzoneShareUrl.searchParams.set("title", shareData.value.title);
          qzoneShareUrl.searchParams.set("summary", shareData.value.text);
          qzoneShareUrl.searchParams.set("pics", shareData.value.image);
          qzoneShareUrl.searchParams.set("desc", shareData.value.desc);
          window.open(qzoneShareUrl.toString());
        }
        break;
      case "weibo":
        {
          // 微博: https://service.weibo.com/share/share.php?url=链接&title=标题&pic=图片&appkey=微博应用Key
          const weiboShareUrl =
            `https://service.weibo.com/share/share.php` +
            `?url=${encodeURIComponent(shareData.value.url)}` +
            `&title=${encodeURIComponent(`${shareData.value.title}\n${shareData.value.text}`)}` +
            `&pic=${encodeURIComponent(shareData.value.image)}`;
          window.open(weiboShareUrl);
        }
        break;
      case "qr":
        isQrPopupShow.value = true;
        break;
      case "link-o":
        {
          const message = t(pickRandom(TEAM_INVITE_MESSAGE_KEYS), { name: teamDetail.value.name });
          await copy(`${message}\n${shareData.value.url}`);
          showSuccessToast({ message: t("已复制\n快去分享给你的伙伴吧！") });
        }
        break;
      case "share-o":
        try {
          await share.share();
        } catch (error) {
          // 用户主动取消分享时不提示
          if (error instanceof DOMException && error.name === "AbortError") return;
          showErrorToast(t("分享失败，请稍后重试"));
        }
        break;
    }
  }
};

const handleDisbandClick = () => {
  void confirmAction({
    title: t("解散队伍"),
    message: t("确认解散当前队伍吗？解散后所有队员都需要重新加入队伍。"),
    action: () => mutateDisbandTeam(),
    onSuccess: async () => {
      showSuccessToast({ message: t("解散成功") });
      await refreshUserInfo();
      await router.replace({ name: "team-info" });
    }
  });
};

const handleLeaveTeamClick = () => {
  void confirmAction({
    title: t("退出队伍"),
    message: t("确认退出当前队伍吗？退出后需要重新加入队伍。"),
    action: () => mutateLeaveTeam(),
    onSuccess: async () => {
      showSuccessToast({ message: t("退出成功") });
      await refreshUserInfo();
      await router.replace({ name: "team-info" });
    }
  });
};

const handleSubmissionClick = () => {
  if (!teamDetail.value) {
    showErrorToast(t("团队详细信息加载中"));
    return;
  }

  if (teamDetail.value.submitted) {
    void confirmAction({
      title: t("取消提交"),
      message: t("确认取消当前队伍提交状态吗？"),
      action: () => mutateUndoTeamSubmission(),
      onSuccess: async () => {
        showSuccessToast({ message: t("取消提交成功") });
        await refreshTeamData();
      }
    });
    return;
  }

  if (sortedMembers.value.length < TEAM_SUBMIT_MIN_SIZE) {
    showErrorToast(t("当前团队人数不足"));
    return;
  }

  mutateSubmitTeam();
};
// #endregion
</script>
