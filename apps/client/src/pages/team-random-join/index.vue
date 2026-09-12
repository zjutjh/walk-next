<template>
  <div ref="pageRef" :class="styles.page">
    <p :class="styles.subtitle">{{ t("team.join.hint") }}</p>

    <van-sticky :offset-top="stickyOffsetTop">
      <random-join-filter
        v-model:route-name="urlQuery.route"
        :class="styles.topArea"
        :route-options="ROUTE_OPTIONS"
      />
    </van-sticky>

    <random-team-list
      :teams="visibleTeams"
      :loading="isRandomTeamListLoading"
      :error="randomTeamListError"
      :joining-team-id="joiningTeamId"
      :join-loading="isRandomJoinPending"
      :is-refetching="isRandomTeamListRefetching"
      :is-button-refetching="isButtonRefetching"
      @join="handleJoinClick"
      @retry="refetchRandomTeamList"
      @refresh="refetchRandomTeamList"
    />

    <Transition name="fade">
      <van-icon
        v-if="isRefreshBtnVisible"
        :class="refreshBtnClass"
        name="replay"
        @click="handleButtonRefresh"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { useScroll } from "@vueuse/core";
import { RequestError, useStoredUrlQuery } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
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
const { updateUserInfo } = useClientUserData();

/** 选中路线，通过 URL Query 持久化，刷新后保留 */
const { urlQuery } = useStoredUrlQuery<{ route: RouteName }>({
  defaultValue: { route: ROUTE_OPTIONS[0].name }
});

const joiningTeamId = ref<number>();
const isButtonRefetching = ref(false);

// 吸顶时 fixed 定位相对视口，偏移量需为 navbar 底边（含刘海安全区），避免盖住导航栏
const stickyOffsetTop = ref(0);

onMounted(() => {
  stickyOffsetTop.value =
    document.querySelector(".van-nav-bar")?.getBoundingClientRect().bottom ?? 0;
});

/** 切回缓存窗口：切走某路线 1 秒内切回时复用缓存、不重新拉取 */
const REJOIN_CACHE_WINDOW_MS = 1000;

/** 各路线最近一次被切走的时间戳（非响应式，仅供 staleTime 判断） */
const routeLastLeftAt: Partial<Record<string, number>> = {};

watch(
  () => urlQuery.value.route,
  (_route, prevRoute) => {
    routeLastLeftAt[prevRoute] = Date.now();
  }
);

const {
  data: randomTeamListData,
  isLoading: isRandomTeamListLoading,
  isRefetching: isRandomTeamListRefetching,
  error: randomTeamListError,
  refetch: refetchRandomTeamList
} = useQuery({
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.RANDOM_LIST, urlQuery.value.route] as const),
  queryFn: () =>
    walkClientService.QueryRandomTeamList({
      // eslint-disable-next-line camelcase
      route_name: urlQuery.value.route
    }),
  // 倾向每次请求新数据；但切走 1 秒内切回时视为新鲜（按切走时刻判断），复用缓存不发请求；
  // gcTime 配合保留缓存，切回时直接展示旧数据、无 loading
  staleTime: (query) => {
    const leftAt = routeLastLeftAt[String(query.queryKey[1])];
    return leftAt !== undefined && Date.now() - leftAt < REJOIN_CACHE_WINDOW_MS
      ? Number.POSITIVE_INFINITY
      : 0;
  },
  gcTime: REJOIN_CACHE_WINDOW_MS
});

const visibleTeams = computed(
  () => randomTeamListData.value?.teams.filter((team) => team.num < MAXIMUM_TEAM_SIZE) ?? []
);

const pageRef = useTemplateRef<HTMLElement>("pageRef");

const scrollContainer = computed(() => pageRef.value?.closest("main") ?? null);

const { y: scrollY } = useScroll(scrollContainer);

const refreshBtnClass = computed(() => [
  styles.refreshBtn,
  isRandomTeamListRefetching.value ? styles.refreshing : ""
]);

const isRefreshBtnVisible = computed(() => scrollY.value > 50);

const { mutate: mutateRandomJoinTeam, isPending: isRandomJoinPending } = useMutation({
  mutationFn: (teamId: number) => walkClientService.RandomJoinTeam({ id: teamId }),
  onSuccess: async () => {
    showSuccessToast({
      message: t("加入成功！"),
      duration: 3000,
      position: "top"
    });

    // 人数与加入次数已变动，拉取最新用户信息
    const userInfo = await queryClient.fetchQuery({
      ...CLIENT_USER_INFO_QUERY_OPTIONS,
      staleTime: 0
    });

    updateUserInfo(userInfo);

    router.replace({ name: "team-info" });
  },
  onError: (error) => {
    joiningTeamId.value = undefined;
    showFailToast({
      message: (error instanceof RequestError && error.message) || t("加入失败，请稍后重试"),
      position: "top"
    });
  }
});

const handleButtonRefresh = async () => {
  isButtonRefetching.value = true;
  await refetchRandomTeamList();
  isButtonRefetching.value = false;
};

const handleJoinClick = (teamId: number) => {
  if (isRandomJoinPending.value) return;

  joiningTeamId.value = teamId;
  mutateRandomJoinTeam(teamId);
};
</script>
