import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { showDialog, showFailToast } from "vant";
import { watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import { useClientUserData } from "./client-user-data";

const CLIENT_NOTICE_QUERY_OPTIONS = queryOptions({
  queryKey: [CLIENT_QUERY_KEY.USER.NOTICE_LIST] as const,
  queryFn: () => walkClientService.QueryNoticeList()
});

/** 登录后查询并逐条确认未读通知 */
export const setupClientNoticeQuery = () => {
  const route = useRoute();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { isLoggedIn } = useClientUserData(queryClient);

  const { data: noticeList } = useQuery({
    ...CLIENT_NOTICE_QUERY_OPTIONS,
    enabled: () => isLoggedIn.value && route.name !== undefined && route.name !== "login"
  });

  const { mutateAsync: acknowledgeNotice } = useMutation({
    mutationFn: (noticeId: number) =>
      walkClientService.AckNotice({
        // eslint-disable-next-line camelcase
        notice_id: noticeId
      }),
    onError: (error: unknown) => {
      showFailToast({
        message: error instanceof Error ? error.message : t("通知确认失败，请稍后重试")
      });
    }
  });

  let isShowingNotices = false;

  watch(
    noticeList,
    async (data) => {
      if (!data?.notices.length || isShowingNotices) return;

      isShowingNotices = true;

      try {
        for (const notice of data.notices) {
          await showDialog({
            title: t("通知"),
            message: notice.content,
            confirmButtonText: t("我知道了"),
            showCancelButton: false,
            theme: "round-button",
            beforeClose: (action) =>
              action === "confirm"
                ? acknowledgeNotice(notice.id).then(
                    () => true,
                    () => false
                  )
                : true
          });
        }

        await queryClient.invalidateQueries({
          queryKey: CLIENT_NOTICE_QUERY_OPTIONS.queryKey
        });
      } finally {
        isShowingNotices = false;
      }
    },
    { immediate: true, flush: "post" }
  );
};
