<template>
  <div :class="styles.page">
    <language-switcher />
    <query-state-container
      :error="teamInfoError"
      :loading="isTeamInfoLoading"
      :data="teamInfo"
      :btn-text="$t('重试')"
      :loading-text="$t('refresh.loading')"
      :empty-description="$t('邀请已失效')"
      @retry="refetchTeamInfo"
    >
      <invite-card v-if="teamInfo" :class="styles.card" :team="teamInfo">
        <template v-if="canSubmitJoin">
          <p v-if="joinBlockHint" :class="styles.hint">{{ joinBlockHint }}</p>
          <van-button
            block
            type="primary"
            :disabled="isJoinDisabled"
            :loading="isJoinPending"
            @click="mutateJoinTeam"
          >
            {{ $t("确认加入") }}
          </van-button>
        </template>

        <template v-else-if="isLoggedIn">
          <p :class="styles.hint">{{ joinedTeamHint }}</p>
          <van-button block type="primary" @click="goToTeamInfo">
            {{ $t("查看我的团队") }}
          </van-button>
        </template>

        <template v-else>
          <p :class="styles.hint">{{ $t("登录后即可加入队伍") }}</p>
          <div :class="styles.authActions">
            <van-button block round plain type="primary" @click="handleLoginClick">
              {{ $t("登录") }}
            </van-button>
            <van-button block round plain type="primary" @click="handleRegisterClick">
              {{ $t("注册") }}
            </van-button>
          </div>
        </template>
      </invite-card>
    </query-state-container>
  </div>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import { QueryStateContainer, RequestError, RESP_CODE } from "shared";
import { showFailToast, showSuccessToast } from "vant";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import InviteCard from "@/components/invite-card/index.vue";
import LanguageSwitcher from "@/components/language-switcher/index.vue";
import { useClientUserData, useOverrideTitle } from "@/composables";
import { CLIENT_QUERY_KEY, TEAM_INVITE_CARD_TITLE_KEY } from "@/constants";
import { getErrorMessage, walkClientService } from "@/utils";

import styles from "./index.module.scss";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { isLoggedIn, clientUserInfo, refreshUserInfo } = useClientUserData();

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

useOverrideTitle(
  computed(() =>
    teamInfo.value ? t(TEAM_INVITE_CARD_TITLE_KEY, { name: teamInfo.value.name }) : undefined
  )
);

const canSubmitJoin = computed(() => {
  const role = clientUserInfo.value?.role;
  return isLoggedIn.value && role !== "member" && role !== "captain";
});

const joinBlockHint = computed(() => {
  if (clientUserInfo.value?.join_op === 0) return t("加入团队次数已用完");
  if (teamInfo.value?.is_full === true) return t("团队人数已满");
  return "";
});

const isJoinDisabled = computed(() => joinBlockHint.value !== "");

const joinedTeamHint = computed(() =>
  clientUserInfo.value?.team_id === teamId.value
    ? t("你已在该队伍中")
    : t("你已加入其他队伍，需先退出才能加入新队伍")
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
    await refreshUserInfo();
    goToTeamInfo();
  },
  onError: (error) => {
    if (error instanceof RequestError && error.code === RESP_CODE.NO_JOIN_CHANCE) {
      showFailToast({ message: t("加入团队次数已用完") });
      return;
    }

    showFailToast({ message: getErrorMessage(error, t("加入失败，请稍后重试")) });
  }
});

const redirectQuery = computed(() => ({ fromPath: encodeURIComponent(route.fullPath) }));

const handleLoginClick = () => {
  router.push({ name: "login", query: redirectQuery.value });
};

const handleRegisterClick = () => {
  router.push({ name: "register", query: redirectQuery.value });
};

const goToTeamInfo = () => {
  router.replace({ name: "team-info" });
};
</script>
