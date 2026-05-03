<template>
  <default-layout>
    <div :class="styles.pageContainer">
      <van-cell-group inset :class="styles.groupMargin">
        <van-cell title="路线" is-link @click="isRouteSheetVisible = true">
          <template #value>
            <span>{{ getRouteDisplayName(currentRoute) }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="队伍成员" :class="styles.groupMargin">
        <van-empty
          v-if="memberList.length === 0"
          image="search"
          description="暂无成员"
          :class="styles.empty"
        />
        <van-cell
          v-for="member in memberList"
          :key="member.id"
          :title="member.name"
          is-link
          @click="handleMemberClick(member)"
        >
          <template #value>
            <span :class="styles.memberStatus">{{ member.status }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div :class="styles.memberCount">已添加 {{ memberList.length }}/6 人，提交需 3-6 人</div>

      <div :class="styles.buttonContainer">
        <van-button
          type="primary"
          block
          plain
          :class="styles.btnSpacing"
          @click="handleScanAddClick"
          >扫码添加</van-button
        >
        <van-button
          type="primary"
          block
          plain
          :class="styles.btnSpacing"
          @click="handleRegisterClick"
          >登记信息</van-button
        >
        <van-button
          type="primary"
          block
          :loading="isPending"
          :disabled="isSubmitDisabled || isPending"
          @click="handleSubmit"
          >提交队伍</van-button
        >
      </div>
    </div>
  </default-layout>

  <van-action-sheet
    v-model:show="isRouteSheetVisible"
    :actions="routeActions"
    cancel-text="取消"
    @select="onRouteSelect"
  />

  <van-action-sheet
    v-model:show="isMemberSheetVisible"
    :actions="memberActions"
    cancel-text="取消"
    :description="currentMember?.name || '请选择操作'"
    @select="onActionSelect"
  />

  <van-popup v-model:show="isRegisterPopupVisible" round position="bottom">
    <van-form :class="styles.registerForm" @submit="handleRegisterSubmit">
      <h2 :class="styles.registerTitle">登记信息</h2>
      <van-field
        v-model="registerUserId"
        name="userId"
        label="用户编号"
        placeholder="请输入用户编号"
        type="digit"
        clearable
        :rules="[{ required: true, message: '请填写用户编号' }]"
      />
      <div :class="styles.registerActions">
        <van-button
          block
          plain
          type="default"
          native-type="button"
          @click="isRegisterPopupVisible = false"
          >取消</van-button
        >
        <van-button block type="primary" native-type="submit" :loading="isQueryingUser"
          >添加</van-button
        >
      </div>
    </van-form>
  </van-popup>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { TeamRebuildMember } from "api/types/admin";
import { showFailToast, showSuccessToast, showToast } from "vant";
import { computed, ref } from "vue";

import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils/service";
import { ROUTE_LIST, type RouteId, STRICT_ROUTE_CONFIG } from "@/walk-config";

import styles from "./index.module.scss";

const memberList = ref<TeamRebuildMember[]>([]);
const isRouteSheetVisible = ref(false);
const isMemberSheetVisible = ref(false);
const isRegisterPopupVisible = ref(false);
const currentRoute = ref<RouteId | "">("");
const currentMember = ref<TeamRebuildMember | null>(null);
const registerUserId = ref("");
const routeActions = ROUTE_LIST.map((routeId) => ({
  name: STRICT_ROUTE_CONFIG[routeId].text,
  value: routeId
}));
const memberActions = [{ name: "删除", color: "#FA2D2D", value: "delete" }];

const isSubmitDisabled = computed(() => memberList.value.length < 3 || memberList.value.length > 6);

const onRouteSelect = (action: { value: RouteId }) => {
  currentRoute.value = action.value;
  isRouteSheetVisible.value = false;
};

const getRouteDisplayName = (route: RouteId | "") => {
  if (!route) return "选择路线";
  return STRICT_ROUTE_CONFIG[route].text;
};

const handleMemberClick = (member: TeamRebuildMember) => {
  currentMember.value = member;
  isMemberSheetVisible.value = true;
};

const onActionSelect = (action: { value: string }) => {
  if (action.value === "delete" && currentMember.value) {
    const memberId = Number(currentMember.value.id);
    memberList.value = memberList.value.filter((item) => Number(item.id) !== memberId);
    currentMember.value = null;
  }
  isMemberSheetVisible.value = false;
};

const handleScanAddClick = () => {
  // TODO: 接入扫码登记接口后，在这里添加队伍成员
  showToast("扫码登记接口待接入");
};

const handleRegisterClick = () => {
  if (memberList.value.length >= 6) {
    showToast("队伍最多添加6人");
    return;
  }
  registerUserId.value = "";
  isRegisterPopupVisible.value = true;
};

const { mutate: queryUserInfo, isPending: isQueryingUser } = useMutation({
  mutationFn: (userId: number) =>
    walkAdminService.QueryUserInfo({
      // eslint-disable-next-line camelcase
      user_id: userId
    }),
  onSuccess: (userInfo, userId) => {
    if (memberList.value.some((member) => Number(member.id) === userId)) {
      showToast("该成员已添加");
      return;
    }
    if (!userInfo.name) {
      showToast("该人员暂无参赛名额，无法加入队伍");
      return;
    }
    memberList.value.push({
      id: userId,
      name: userInfo.name,
      status: "未开始"
    });
    isRegisterPopupVisible.value = false;
    showSuccessToast("成员已添加");
  },
  onError: (err) => {
    showFailToast(err instanceof Error ? err.message : "获取人员信息失败");
  }
});

const handleRegisterSubmit = () => {
  const userId = Number(registerUserId.value);
  if (!Number.isInteger(userId) || userId <= 0) {
    showToast("用户编号需为正整数");
    return;
  }
  if (memberList.value.some((member) => Number(member.id) === userId)) {
    showToast("该成员已添加");
    return;
  }
  queryUserInfo(userId);
};

const { mutate: submitTeam, isPending } = useMutation({
  mutationFn: () =>
    walkAdminService.RegroupTeam({
      members: memberList.value.map((member) => member.id),
      // eslint-disable-next-line camelcase
      route_name: currentRoute.value
    }),
  onSuccess: (res) => {
    memberList.value = [];
    currentRoute.value = "";
    currentMember.value = null;
    registerUserId.value = "";
    isRegisterPopupVisible.value = false;
    showSuccessToast(`提交成功，队伍编号: ${res.team_id}`);
    // TODO: 参赛人员管理路由完成后，跳转到参赛人员管理页面
  },
  onError: (err) => {
    showFailToast(err instanceof Error ? err.message : "提交失败");
  }
});

const handleSubmit = () => {
  if (!currentRoute.value) {
    showToast("请先选择路线");
    return;
  }
  if (memberList.value.length < 3 || memberList.value.length > 6) {
    showToast("队伍人数需为3-6人");
    return;
  }

  submitTeam();
};
</script>
