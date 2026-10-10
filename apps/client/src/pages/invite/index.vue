<template>
  <div :class="styles.page">
    <error-empty :error="teamInfoError" :disabled="isTeamInfoLoading" @btn-click="refetchTeamInfo">
      <loading-container :loading="isTeamInfoLoading" :text="$t('refresh.loading')">
        <team-card v-if="teamInfo" :class="styles.card" :team="teamInfo">
          <div :class="styles.actionArea">
            <van-button
              v-if="isLoggedIn"
              block
              type="primary"
              :disabled="isJoinDisabled"
              :loading="isJoinPending"
              @click="mutateJoinTeam"
            >
              {{ $t("确认加入") }}
            </van-button>

            <template v-else>
              <p :class="styles.loginHint">{{ $t("登录后即可加入队伍") }}</p>
              <div :class="styles.authActions">
                <van-button block round type="primary" @click="handleLoginClick">
                  {{ $t("登录") }}
                </van-button>
                <van-button block round plain type="primary" @click="handleRegisterClick">
                  {{ $t("注册") }}
                </van-button>
              </div>
            </template>
          </div>
        </team-card>

        <van-empty v-else-if="!isTeamInfoLoading" :description="$t('邀请已失效')" />
      </loading-container>
    </error-empty>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ErrorEmpty, LoadingContainer, RequestError, RESP_CODE } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import { useClientUserData } from "@/composables";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import TeamCard from "./components/team-card/index.vue";
import styles from "./index.module.scss";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const queryClient = useQueryClient();
const { isLoggedIn, clientUserInfo, updateUserInfo } = useClientUserData();

const teamId = computed(() => {
  const raw = route.query.team_id;
  const id = Number(typeof raw === "string" ? raw : Number.NaN);
  return Number.isInteger(id) && id > 0 ? id : undefined;
});

const teamPassword = computed(() => {
  const password = route.query.password;
  if (typeof password !== "string") return "";
  try {
    return decodeURIComponent(atob(password));
  } catch {
    return "";
  }
});

const {
  data: teamInfo,
  isLoading: isTeamInfoLoading,
  error: teamInfoError,
  refetch: refetchTeamInfo
} = useQuery({
  queryKey: computed(() => [CLIENT_QUERY_KEY.TEAM.INFO, teamId.value] as const),
  enabled: () => teamId.value !== undefined,
  queryFn: () => {
    const id = teamId.value;
    if (id === undefined) throw new Error(t("邀请链接无效"));
    return walkClientService.QueryTeamBasicInfo({
      // eslint-disable-next-line camelcase
      team_id: id,
      password: teamPassword.value
    });
  }
});

const isJoinDisabled = computed(
  () => clientUserInfo.value?.role !== "unbind" || teamInfo.value?.is_full === true
);

const { mutate: mutateJoinTeam, isPending: isJoinPending } = useMutation({
  mutationFn: () => {
    const id = teamId.value;
    if (id === undefined) throw new Error(t("邀请链接无效"));
    return walkClientService.JoinTeam({
      // eslint-disable-next-line camelcase
      team_id: id,
      password: teamPassword.value
    });
  },
  onSuccess: async () => {
    showSuccessToast({ message: t("加入成功！") });

    const userInfo = await queryClient.fetchQuery({
      queryKey: [CLIENT_QUERY_KEY.USER.SELF],
      queryFn: () => walkClientService.QueryUserInfo()
    });

    updateUserInfo(userInfo);

    router.replace({ name: "team-info" });
  },
  onError: (error) => {
    if (error instanceof RequestError && error.code === RESP_CODE.NO_JOIN_CHANCE) {
      showFailToast({ message: t("加入团队次数已用完") });
      return;
    }

    showFailToast({
      message: (error instanceof Error && error.message) || t("加入失败，请稍后重试")
    });
  }
});

const redirectQuery = computed(() => ({ fromPath: encodeURIComponent(route.fullPath) }));

const handleLoginClick = () => {
  router.push({ name: "login", query: redirectQuery.value });
};

const handleRegisterClick = () => {
  router.push({ name: "register", query: redirectQuery.value });
};
</script>
