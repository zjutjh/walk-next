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
    <van-cell-group inset title="团队成员">
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
    </van-cell-group>
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
      v-model:member-list="memberList"
      v-model:is-member-id-dialog-visible="isMemberIdDialogVisible"
      v-model:member-id-dialog-value="memberIdDialogValue"
      :class="styles.buttonContainer"
      :team-route="teamRoute"
      :is-rebuild-team-pending="isRebuildTeamPending"
      :is-add-member-pending="isAddMemberPending"
      :guide-select-route-first="guideSelectRouteFirst"
      :mutate-add-member="mutateAddMember"
      :add-member-abort-controller="addMemberAbortController"
      :mutate-rebuild-team="mutateRebuildTeam"
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
      v-model:member-list="memberList"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { TeamRebuildMember } from "api/types/admin";
import { CanceledError } from "axios";
import { isEmpty } from "lodash-es";
import { RequestError } from "shared";
import { showFailToast, showSuccessToast, showToast } from "vant";
import { ref } from "vue";
import { useRouter } from "vue-router";

import { MEMBER_WALK_STATUS_COLOR_MAP, MEMBER_WALK_STATUS_TEXT } from "@/constants";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils";
import { ROUTE_CONFIG, ROUTE_LIST, type RouteId } from "@/walk-config";

import ButtonList from "./components/button-list/index.vue";
import MemberActionSheet from "./components/member-action-sheet/index.vue";
import { TEAM_REBUILD_MEMBER_COUNT_LIMIT } from "./constants";
import styles from "./index.module.scss";
import type { RoutePickerAction } from "./types";

const router = useRouter();

/** 重组的团队的成员列表 */
const memberList = ref<TeamRebuildMember[]>([]);
/** 重组的团队的路线 */
const teamRoute = ref<RouteId | "">("");

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
// 获取成员信息并添加成员到团队
const { mutate: mutateAddMember, isPending: isAddMemberPending } = useMutation({
  mutationFn: (memberId: number) => {
    addMemberAbortController?.abort();
    addMemberAbortController = new AbortController();
    return walkAdminService.QueryMemberInfo(
      {
        user_id: memberId
      },
      { signal: addMemberAbortController.signal }
    );
  },
  onSuccess: (memberInfo, userId) => {
    // 人员状态验证
    if (memberInfo.status !== "not_start" && memberInfo.status !== "pending") {
      showFailToast("须为未开始或待出发人员");
      return;
    }
    isMemberIdDialogVisible.value = false;
    memberList.value.push({
      id: userId,
      name: memberInfo.name,
      status: memberInfo.status
    });
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
      members: memberList.value.map((member) => member.id),
      route_name: teamRoute.value
    }),
  onSuccess: (res) => {
    memberList.value = [];
    teamRoute.value = "";
    showSuccessToast("重组成功");
    router.push({ name: "team-info", params: { teamIdParam: res.team_id } });
  },
  onError: (err) => {
    showFailToast(err.message || "重组团队失败");
  }
});
</script>
