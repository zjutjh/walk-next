<!-- 团队重组页 -->
<template>
  <default-layout :class="styles.page">
    <van-cell-group inset>
      <!-- 路线选择按钮 -->
      <van-cell
        :value="ROUTE_CONFIG[teamRoute]?.text ?? '请选择路线'"
        title="团队路线"
        is-link
        @click="openRoutePickerSheet"
      ></van-cell>
    </van-cell-group>
    <!-- 成员列表 -->
    <cell-group
      :loading="isMemberInfoFetching"
      :error="memberInfoError"
      inset
      title="团队成员"
      @retry-click="refetchMemberInfo"
    >
      <div v-if="isEmpty(memberList)" :class="styles.emptyText">点击下方按钮，添加成员</div>
      <van-cell
        v-for="member in memberList"
        :key="member.id"
        :title="member.name"
        is-link
        @click="openMemberActionSheet(member.id)"
      >
        <span :style="{ color: MEMBER_WALK_STATUS_COLOR_MAP[member.status] }">{{
          MEMBER_WALK_STATUS_TEXT[member.status]
        }}</span>
      </van-cell>
    </cell-group>
    <!-- 成员数量提示 -->
    <div :class="styles.memberCountText">
      已添加 {{ memberList.length }} 人，提交需 {{ TEAM_REBUILD_MEMBER_COUNT_LIMIT.MIN }}-{{
        TEAM_REBUILD_MEMBER_COUNT_LIMIT.MAX
      }}
      人
    </div>

    <div :class="styles.middleWhiteSpace"></div>

    <!-- 功能按钮列表 -->
    <button-list
      v-model:is-member-id-dialog-visible="isMemberIdDialogVisible"
      v-model:member-id-dialog-value="memberIdDialogValue"
      v-model:member-id-list="memberIdList"
      :class="styles.buttonContainer"
      :team-route="teamRoute"
      :member-list="memberList"
      :is-rebuild-team-pending="isRebuildTeamPending"
      :is-add-member-pending="isAddMemberPending"
      @click-add-member-with-route-unelected="guideSelectRouteFirst"
      @mutate-add-member="mutateAddMember"
      @cancel-mutate-add-member="cancelMutateAddMember"
      @mutate-rebuild-team="mutateRebuildTeam"
    />

    <!-- 路线选择弹层 -->
    <van-action-sheet
      v-model:show="isRoutePickerVisible"
      :actions="routePickerActions"
      cancel-text="取消"
      @select="handleSelectRoute"
    />

    <!-- 成员操作弹层 -->
    <member-action-sheet
      v-model:visible="isMemberActionSheetVisible"
      v-model:member-id="memberActionSheetMemberId"
      v-model:member-id-list="memberIdList"
      :member-list="memberList"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation, useQueries, useQueryClient } from "@tanstack/vue-query";
import { useArraySome } from "@vueuse/core";
import type { AdminAPI, TeamRebuildMember } from "api/types/admin";
import { CanceledError } from "axios";
import { compact, isEmpty, isNil, zipObject } from "lodash-es";
import { CellGroup, RequestError } from "shared";
import { showFailToast, showSuccessToast, showToast } from "vant";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import {
  ADMIN_QUERY_KEY,
  MEMBER_WALK_STATUS_COLOR_MAP,
  MEMBER_WALK_STATUS_TEXT
} from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils";
import { ROUTE_CONFIG, ROUTE_LIST, type RouteId } from "@/walk-config";

import ButtonList from "./components/button-list/index.vue";
import MemberActionSheet from "./components/member-action-sheet/index.vue";
import { TEAM_REBUILD_MEMBER_COUNT_LIMIT } from "./constants";
import styles from "./index.module.scss";
import type { RoutePickerAction } from "./types";

const router = useRouter();
const queryClient = useQueryClient();

/** 重组的团队的成员ID列表 */
const memberIdList = ref<number[]>([]);
/** 重组的团队的路线 */
const teamRoute = ref<RouteId | "">("");

// 获取重组的团队的成员信息
const memberInfoQueryMap = useQueries({
  queries: () =>
    memberIdList.value.map((memberId) => ({
      staleTime: Infinity,
      queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO, memberId] as const,
      queryFn: () =>
        walkAdminService.QueryMemberInfo({
          user_id: memberId
        })
    })),
  combine: (results) => zipObject(memberIdList.value, results)
});
/** 重组的团队成员列表 */
const memberList = computed<TeamRebuildMember[]>(() =>
  compact(
    memberIdList.value.map((memberId) => {
      const queryData = memberInfoQueryMap.value[memberId]?.data;
      return queryData
        ? {
            id: memberId,
            ...queryData
          }
        : undefined;
    })
  )
);
/** 是否正在拉取任意成员信息 */
const isMemberInfoFetching = useArraySome(
  memberIdList,
  (memberId) => memberInfoQueryMap.value[memberId]?.isFetching
);
/** 拉取成员信息的其中一个错误 */
const memberInfoError = computed(() => {
  for (const memberId of memberIdList.value) {
    if (!isNil(memberInfoQueryMap.value[memberId]?.error)) {
      return memberInfoQueryMap.value[memberId].error;
    }
  }
  return null;
});
/** 重新拉取成员信息 */
const refetchMemberInfo = () => {
  queryClient.refetchQueries({
    queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO],
    type: "active"
  });
};

/** 人员ID输入弹窗是否显示 */
const isMemberIdDialogVisible = ref(false);
/** 人员ID输入弹窗 表单值 */
const memberIdDialogValue = ref({ memberIdStr: "" });

/** 引导用户先选择路线 */
const guideSelectRouteFirst = () => {
  showToast({
    message: "请先选择路线",
    zIndex: 3000
  });
  openRoutePickerSheet();
};

/** 路线选择弹层是否可见 */
const isRoutePickerVisible = ref(false);
/** 路线选择弹层选项列表 */
const routePickerActions: RoutePickerAction[] = ROUTE_LIST.map((routeId) => ({
  name: ROUTE_CONFIG[routeId].text,
  routeId: routeId
}));

/** 打开路线选择弹层 */
const openRoutePickerSheet = () => {
  isRoutePickerVisible.value = true;
};

/** 选择路线 */
const handleSelectRoute = (action: RoutePickerAction) => {
  teamRoute.value = action.routeId;
  isRoutePickerVisible.value = false;
};

/** 成员操作弹层当前操作的成员ID */
const memberActionSheetMemberId = ref<number>();
/** 成员操作弹层是否可见 */
const isMemberActionSheetVisible = ref(false);

/** 打开成员操作弹层 */
const openMemberActionSheet = (memberId: number) => {
  memberActionSheetMemberId.value = memberId;
  isMemberActionSheetVisible.value = true;
};

/** 获取成员信息并添加成员到团队 取消控制器 */
let addMemberAbortController: AbortController | null = null;
/** 取消添加成员请求 */
const cancelMutateAddMember = () => {
  addMemberAbortController?.abort();
};
// 获取成员信息并添加成员到团队
const { mutate: mutateAddMember, isPending: isAddMemberPending } = useMutation({
  mutationFn: (memberId: number) => {
    cancelMutateAddMember();
    addMemberAbortController = new AbortController();
    return walkAdminService.QueryMemberInfo(
      {
        user_id: memberId
      },
      { signal: addMemberAbortController.signal }
    );
  },
  onSuccess: (memberInfo, memberId) => {
    // 人员状态验证
    if (memberInfo.status !== "not_start" && memberInfo.status !== "pending") {
      showFailToast("须为未开始或待出发人员");
      return;
    }
    memberIdList.value.push(memberId);
    // 写入缓存
    queryClient.setQueryData<AdminAPI.QueryMemberInfoResponse>(
      [ADMIN_QUERY_KEY.MEMBER.INFO, memberId],
      memberInfo
    );
    // 刷新其他成员数据
    queryClient.refetchQueries({
      queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO],
      type: "active",
      predicate: (query) => query.queryKey[1] !== memberId
    });
    isMemberIdDialogVisible.value = false;
    memberIdDialogValue.value.memberIdStr = "";
  },
  onError: (err) => {
    if (err instanceof RequestError && err.originError instanceof CanceledError) return;
    showFailToast(err instanceof Error ? err.message : "获取人员信息失败");
  }
});

// 重组团队
const { mutate: mutateRebuildTeam, isPending: isRebuildTeamPending } = useMutation({
  mutationFn: () =>
    walkAdminService.RebuildTeam({
      members: memberIdList.value,
      route_name: teamRoute.value
    }),
  onSuccess: (res) => {
    memberIdList.value = [];
    teamRoute.value = "";
    showSuccessToast("重组成功");
    router.push({ name: "team-info", params: { teamIdParam: res.team_id } });
  },
  onError: (err) => {
    showFailToast(err.message || "重组团队失败");
    // 刷新数据
    queryClient.refetchQueries({
      queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO],
      type: "active"
    });
  }
});
</script>
