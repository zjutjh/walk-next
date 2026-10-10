<template>
  <div :class="styles.page">
    <error-empty
      :error="overviewError"
      :disabled="isOverviewLoading"
      :btn-text="t('刷新')"
      @btn-click="reload"
    >
      <loading-container
        :class="styles.loadingContainer"
        :loading="isOverviewLoading"
        :text="t('refresh.loading')"
      >
        <template v-if="teamOverview && !isOverviewLoading">
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

        <van-empty v-else-if="!isOverviewLoading" :description="t('暂无团队信息')" />
      </loading-container>
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

    <van-share-sheet
      v-model:show="isShareSheetShow"
      :title="t('分享队伍')"
      :options="shareOptions"
      @select="handleShareOperation"
    />

    <van-popup v-model:show="isQrPopupShow" round :class="styles.qrPopup">
      <qr-code :value="shareData.url" :class="styles.qrCode" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useClipboard, useEventListener, useShare, useTimeoutFn } from "@vueuse/core";
import { ErrorEmpty, LoadingContainer, RequestError, RESP_CODE } from "shared";
import { type ShareSheetOption, showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import QrCode from "@/components/qr-code/index.vue";
import { useClientUserData } from "@/composables";
import {
  CLIENT_QUERY_KEY,
  TEAM_INVITE_CARD_TITLE_KEY,
  TEAM_INVITE_DESCRIPTION,
  TEAM_INVITE_LINK_CARD_SUMMARY,
  TEAM_INVITE_MESSAGE_KEYS
} from "@/constants";
import TeamMemberDetailPopup from "@/pages/team-detail/components/team-member-detail-popup/index.vue";
import TeamMemberList from "@/pages/team-detail/components/team-member-list/index.vue";
import TeamOverviewCard from "@/pages/team-detail/components/team-overview-card/index.vue";
import TeamPassCode from "@/pages/team-info/components/team-pass-code/index.vue";
import { walkClientService } from "@/utils";

import styles from "./index.module.scss";

// #region 队伍与队员数据
const TEAM_SUBMIT_MIN_SIZE = 4;

const router = useRouter();
const { t } = useI18n();
const queryClient = useQueryClient();
const { clientUserInfo, updateUserInfo } = useClientUserData();

const selectedMemberId = ref<number>();
const isMemberDetailPopupOpened = ref(false);

const isCaptain = computed(() => clientUserInfo.value?.role === "captain");

const isMember = computed(() => clientUserInfo.value?.role === "member");

const isLeaveTeamVisible = computed(() => isMember.value); // 暂时无条件展示 && teamDetail.value?.submitted === false

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

const sortedMembers = computed(() => {
  const members = teamOverview.value?.members ?? [];

  return members
    .map((member, index) => ({ member, index }))
    .toSorted((left, right) => {
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

const refreshClientUserData = async () => {
  const userInfo = await queryClient.fetchQuery({
    queryKey: [CLIENT_QUERY_KEY.USER.SELF],
    queryFn: () => walkClientService.QueryUserInfo()
  });

  updateUserInfo(userInfo);
};

const getSubmitErrorMessage = (error: Error) => {
  if (!(error instanceof RequestError)) return error.message || t("提交失败，请稍后重试");

  switch (error.code) {
    case RESP_CODE.TEAM_NOT_ENOUGH:
      return t("当前团队人数不足");
    case RESP_CODE.NOT_IN_REGISTER_TIME:
      return t("未到提交时间");
    case RESP_CODE.USER_NO_QUOTA:
      return t("当天名额已满");
    default:
      return error.message || t("提交失败，请稍后重试");
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
      showErrorToast(error.message || t("取消提交失败，请稍后重试"));
    }
  });

const { mutateAsync: mutateDisbandTeam, isPending: isDisbandTeamPending } = useMutation({
  mutationFn: () => walkClientService.DisbandTeam(),
  onError: (error) => {
    showErrorToast(error.message || t("解散失败，请稍后重试"));
  }
});

const { mutateAsync: mutateLeaveTeam, isPending: isLeaveTeamPending } = useMutation({
  mutationFn: () => walkClientService.LeaveTeam(),
  onError: (error) => {
    showErrorToast(error.message || t("退出失败，请稍后重试"));
  }
});

const { mutateAsync: mutateRemoveMember, isPending: isRemoveMemberPending } = useMutation({
  mutationFn: (memberId: number) => walkClientService.RemoveTeamMember({ id: memberId }),
  onError: (error) => {
    showErrorToast(error.message || t("删除失败，请稍后重试"));
  }
});

const { mutateAsync: mutateTransferCaptain, isPending: isTransferCaptainPending } = useMutation({
  mutationFn: (memberId: number) => walkClientService.UpdateTeamCaptain({ id: memberId }),
  onError: (error) => {
    showErrorToast(error.message || t("移交失败，请稍后重试"));
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
  selectedMemberId.value = undefined;
};

// MARK: 删除队员
const handleRemoveMemberClick = (memberId: number) => {
  void showConfirmDialog({
    title: t("删除队员"),
    message: t("确认将该队员移出队伍吗？"),
    theme: "round-button",
    beforeClose: async (action) => {
      if (action !== "confirm") return true;

      try {
        await mutateRemoveMember(memberId);
        return true;
      } catch {
        return false;
      }
    }
  })
    .then(async () => {
      handleMemberPopupClose();
      showSuccessToast({ message: t("删除成功") });
      await refreshTeamData();
    })
    .catch(() => undefined);
};

// MARK: 移交队长
const handleTransferCaptainClick = (memberId: number) => {
  void showConfirmDialog({
    title: t("移交队长"),
    message: t("确认将队长移交给该队员吗？移交后你将变为队员。"),
    theme: "round-button",
    beforeClose: async (action) => {
      if (action !== "confirm") return true;

      try {
        await mutateTransferCaptain(memberId);
        return true;
      } catch {
        return false;
      }
    }
  })
    .then(async () => {
      handleMemberPopupClose();
      showSuccessToast({ message: t("移交成功") });
      await Promise.all([refreshTeamData(), refreshClientUserData()]);
    })
    .catch(() => undefined);
};

// MARK: 分享
const isShareSheetShow = ref(false);
const isQrPopupShow = ref(false);

const pickRandom = <T,>(l: readonly [T, ...T[]]): T =>
  l[Math.floor(Math.random() * l.length)] ?? l[0];

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

          const { stop } = useTimeoutFn(() => {
            const fallbackUrl = new URL("https://connect.qq.com/widget/shareqq/");
            fallbackUrl.searchParams.set("url", shareData.value.url);
            fallbackUrl.searchParams.set("title", shareData.value.title);
            fallbackUrl.searchParams.set("summary", shareData.value.text);
            fallbackUrl.searchParams.set("pics", shareData.value.image);
            fallbackUrl.searchParams.set("desc", shareData.value.desc);
            window.open(fallbackUrl.toString());
          }, 1500);
          useEventListener(document, "visibilitychange", () => {
            if (document.hidden) stop();
          });
          window.location.href = mqqUrl;
        }
        break;
      case "star-o":
        {
          // QQ空间: http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=链接&title=标题&desc=描述&summary=摘要&site=来源&pics=图片
          const qzoneShareUrl = new URL(
            "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey"
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

// MARK: 解散
const handleDisbandClick = () => {
  void showConfirmDialog({
    title: t("解散队伍"),
    message: t("确认解散当前队伍吗？解散后所有队员都需要重新加入队伍。"),
    theme: "round-button",
    beforeClose: async (action) => {
      if (action !== "confirm") return true;

      try {
        await mutateDisbandTeam();
        return true;
      } catch {
        return false;
      }
    }
  })
    .then(async () => {
      showSuccessToast({ message: t("解散成功") });
      await refreshClientUserData();
      await router.replace({ name: "team-info" });
    })
    .catch(() => undefined);
};

// MARK: 退出
const handleLeaveTeamClick = () => {
  void showConfirmDialog({
    title: t("退出队伍"),
    message: t("确认退出当前队伍吗？退出后需要重新加入队伍。"),
    theme: "round-button",
    beforeClose: async (action) => {
      if (action !== "confirm") return true;

      try {
        await mutateLeaveTeam();
        return true;
      } catch {
        return false;
      }
    }
  })
    .then(async () => {
      showSuccessToast({ message: t("退出成功") });
      await refreshClientUserData();
      await router.replace({ name: "team-info" });
    })
    .catch(() => undefined);
};

// MARK: 提交
const handleSubmissionClick = () => {
  if (!teamDetail.value) {
    showErrorToast(t("团队详细信息加载中"));
    return;
  }

  if (teamDetail.value.submitted) {
    void showConfirmDialog({
      title: t("取消提交"),
      message: t("确认取消当前队伍提交状态吗？"),
      theme: "round-button",
      beforeClose: async (action) => {
        if (action !== "confirm") return true;

        try {
          await mutateUndoTeamSubmission();
          return true;
        } catch {
          return false;
        }
      }
    })
      .then(async () => {
        showSuccessToast({ message: t("取消提交成功") });
        await refreshTeamData();
      })
      .catch(() => undefined);
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
