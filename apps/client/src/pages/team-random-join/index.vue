<template>
  <div :class="styles.page">
    <p :class="styles.subtitle">{{ t("team.join.hint") }}</p>

    <van-sticky :offset-top="stickyOffsetTop">
      <section :class="styles.topArea">
        <random-join-filter v-model:route-name="urlQuery.route" :route-options="ROUTE_OPTIONS" />
      </section>
    </van-sticky>

    <random-team-list
      :teams="visibleTeams"
      :loading="isRandomTeamListLoading"
      :error="randomTeamListError"
      :joining-team-id="joiningTeamId"
      :join-loading="isRandomJoinPending"
      @join="handleJoinClick"
      @retry="refetchRandomTeamList"
    />
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { RequestError, RESP_CODE, useStoredUrlQuery } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import { CLIENT_USER_INFO_QUERY_OPTIONS, useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY, MAXIMUM_TEAM_SIZE } from "@/constants";
import { walkClientService } from "@/utils";

import RandomJoinFilter from "./components/random-join-filter/index.vue";
import RandomTeamList from "./components/random-team-list/index.vue";
import styles from "./index.module.scss";
import type { RouteName } from "./types";

const ROUTE_OPTIONS = [
  { name: "pf-half", title: "屏峰半程", distanceKm: 11 },
  { name: "pf-full", title: "屏峰全程", distanceKm: 16 },
  { name: "mgs", title: "莫干山全程", distanceKm: 17 }
] as const;

const router = useRouter();
const { t } = useI18n();
const queryClient = useQueryClient();
const { updateClientUserData } = useClientUserData();

/** 选中路线，通过 URL Query 持久化，刷新后保留 */
const { urlQuery } = useStoredUrlQuery<{ route: RouteName }>({
  defaultValue: { route: ROUTE_OPTIONS[0].name }
});

const joiningTeamId = ref<number>();

// 吸顶时 fixed 定位相对视口，偏移量需为 navbar 底边（含刘海安全区），避免盖住导航栏
const stickyOffsetTop = ref(0);

onMounted(() => {
  stickyOffsetTop.value =
    document.querySelector(".van-nav-bar")?.getBoundingClientRect().bottom ?? 0;
});

const {
  data: randomTeamListData,
  isLoading: isRandomTeamListLoading,
  error: randomTeamListError,
  refetch: refetchRandomTeamList
} = useQuery({
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.RANDOM_LIST, urlQuery.value.route] as const),
  queryFn: () =>
    walkClientService.QueryRandomTeamList({
      // eslint-disable-next-line camelcase
      route_name: urlQuery.value.route
    })
});

const visibleTeams = computed(
  () => randomTeamListData.value?.teams.filter((team) => team.num < MAXIMUM_TEAM_SIZE) ?? []
);

const { mutate: mutateRandomJoinTeam, isPending: isRandomJoinPending } = useMutation({
  mutationFn: (teamId: number) => walkClientService.RandomJoinTeam({ id: teamId }),
  onSuccess: async () => {
    showSuccessToast({
      message: t("加入成功！"),
      duration: 3000,
      position: "top"
    });

    // 人数与加入次数已变动，绕过 staleTime: Infinity 强制拉取最新用户信息
    const userInfo = await queryClient.fetchQuery({
      ...CLIENT_USER_INFO_QUERY_OPTIONS,
      staleTime: 0
    });

    updateClientUserData({ userInfo });

    window.setTimeout(() => {
      router.replace({ name: "team-info" });
    }, 3000);
  },
  onError: (error) => {
    joiningTeamId.value = undefined;
    showFailToast({
      message:
        error instanceof RequestError && error.code === RESP_CODE.NO_JOIN_CHANCE
          ? t("加入团队次数已用完")
          : t("加入失败，请稍后重试"),
      position: "top"
    });
  }
});

const handleJoinClick = (teamId: number) => {
  if (isRandomJoinPending.value) return;

  joiningTeamId.value = teamId;
  mutateRandomJoinTeam(teamId);
};
</script>
