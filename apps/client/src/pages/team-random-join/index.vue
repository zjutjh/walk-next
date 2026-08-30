<template>
  <div :class="styles.page">
    <van-sticky :offset-top="stickyOffsetTop">
      <section :class="styles.topArea">
        <p :class="styles.subtitle">{{ t("team.join.hint") }}</p>

        <random-join-filter v-model:route-name="selectedRouteName" :route-options="ROUTE_OPTIONS" />
      </section>
    </van-sticky>

    <random-team-list
      :teams="visibleTeams"
      :loading="isRandomTeamListLoading"
      :error="randomTeamListError"
      :joining-team-id="joiningTeamId"
      :join-loading="isRandomJoinPending"
      @join="handleJoinClick"
      @retry="handleRandomTeamListRetry"
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

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import RandomJoinFilter from "./components/random-join-filter/index.vue";
import RandomTeamList from "./components/random-team-list/index.vue";
import styles from "./index.module.scss";
import type { RouteName } from "./types";

const TEAM_MEMBER_LIMIT = 6;

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

const selectedRouteName = computed({
  get: () => urlQuery.value.route,
  set: (routeName) => {
    urlQuery.value.route = routeName;
  }
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
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.RANDOM_LIST, selectedRouteName.value] as const),
  queryFn: () =>
    walkClientService.QueryRandomTeamList({
      // eslint-disable-next-line camelcase
      route_name: selectedRouteName.value
    })
});

const visibleTeams = computed(
  () => randomTeamListData.value?.teams.filter((team) => team.num < TEAM_MEMBER_LIMIT) ?? []
);

const getRandomJoinErrorMessage = (error: Error) => {
  if (error instanceof RequestError && error.code === RESP_CODE.NO_JOIN_CHANCE) {
    return t("加入团队次数已用完");
  }

  return t("加入失败，请稍后重试");
};

const { mutate: mutateRandomJoinTeam, isPending: isRandomJoinPending } = useMutation({
  mutationFn: (teamId: number) => walkClientService.RandomJoinTeam({ id: teamId }),
  onSuccess: async () => {
    showSuccessToast({
      message: t("加入成功！"),
      duration: 3000,
      position: "top"
    });

    const userInfo = await queryClient.fetchQuery({
      queryKey: [CLIENT_QUERY_KEY.USER.SELF],
      queryFn: () => walkClientService.QueryUserInfo(undefined)
    });

    updateClientUserData({ userInfo });

    window.setTimeout(() => {
      router.replace({ name: "team-info" });
    }, 3000);
  },
  onError: (error) => {
    joiningTeamId.value = undefined;
    showFailToast({
      message: getRandomJoinErrorMessage(error),
      position: "top"
    });
  }
});

const handleJoinClick = (teamId: number) => {
  if (isRandomJoinPending.value) return;
  joiningTeamId.value = teamId;
  mutateRandomJoinTeam(teamId);
};

const handleRandomTeamListRetry = () => {
  void refetchRandomTeamList();
};
</script>
