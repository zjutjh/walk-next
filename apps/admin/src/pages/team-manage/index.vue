<template>
  <default-layout>
    <div class="team-manage">
      <van-cell-group inset class="custom-card team-manage__top-card">
        <van-cell title="队伍路线" :value="teamRoute" value-class="highlight-value" />
        <van-cell title="队伍剩余人数" :value="remainingCount" value-class="highlight-value" />
        <van-cell title="上一点位" :value="prevPoint" value-class="highlight-value" />
      </van-cell-group>

      <div class="team-manage__section-title">成员状态</div>

      <van-cell-group inset class="custom-card team-manage__member">
        <van-cell
          v-for="member in memberList"
          :key="member.id"
          :title="member.name"
          is-link
          @click="openStatusPicker(member.id)"
        >
          <template #value>
            <span :class="getStatusColor(member.status)">
              {{ TEAM_STATUS_MAP[member.status] }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="team-manage__btn-wrap">
        <van-button class="bind-btn" block @click="handleBindTeam"> 团队码绑定 </van-button>
      </div>
    </div>

    <!-- 状态选择弹窗 -->
    <van-action-sheet
      v-model:show="showPicker"
      :actions="STATUS_OPTIONS"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectStatus"
    />

    <!-- 全屏加载遮罩层 -->
    <van-overlay :show="isUpdatingStatus" class="loading-overlay">
      <div class="loading-wrapper">
        <van-loading type="spinner" color="#f0747b" vertical> 更新状态中... </van-loading>
      </div>
    </van-overlay>
  </default-layout>
</template>

<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import type { MemberStatus } from "api/types/admin";
import { type ActionSheetAction, showSuccessToast } from "vant";
import { computed, ref, watch } from "vue";

import { STATUS_OPTIONS, TEAM_STATUS_MAP } from "@/constants/team";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils/service";

const props = defineProps<{
  /** 团队 ID */
  id: string;
}>();

const teamRoute = ref("");
const prevPoint = ref("");

/** 成员数据结构 */
interface Member {
  id: number;
  name: string;
  status: MemberStatus;
}

const memberList = ref<Member[]>([]);

/** 当前团队 ID */
const currentTeamId = computed(() => Number(props.id));

/** 当前团队 ID 是否可用于接口请求 */
const isCurrentTeamIdValid = computed(() => {
  return Number.isInteger(currentTeamId.value) && currentTeamId.value > 0;
});

/** 计算剩余人数 */
const remainingCount = computed(() => {
  return memberList.value.filter((m) => m.status !== "abandoned" && m.status !== "withdrawn")
    .length;
});

/** 重置团队信息 */
const resetTeamData = () => {
  teamRoute.value = "";
  prevPoint.value = "";
  memberList.value = [];
};

/** 拉取团队信息 */
const fetchTeamData = async () => {
  if (!isCurrentTeamIdValid.value) {
    resetTeamData();
    console.error("团队 ID 不合法");
    return;
  }

  try {
    // eslint-disable-next-line camelcase
    const res = await walkAdminService.QueryTeamStatus({ team_id: currentTeamId.value });
    if (res.team) {
      teamRoute.value = res.team.route_name;
      prevPoint.value = res.team.prev_point_name;
    }
    if (res.member) {
      memberList.value = res.member.map((m) => ({
        id: m.user_id,
        name: m.name,
        status: (m.walk_status || "notStart") as MemberStatus
      }));
    }
  } catch (error) {
    console.error("获取团队状态失败", error);
  }
};

watch(currentTeamId, fetchTeamData, { immediate: true });

const showPicker = ref(false);
const currentEditId = ref<number | null>(null);

/** 打开状态选择弹窗 */
const openStatusPicker = (id: number) => {
  currentEditId.value = id;
  showPicker.value = true;
};

/** 更改用户状态的 mutation */
const { mutate: mutateUpdateStatus, isPending: isUpdatingStatus } = useMutation({
  mutationFn: (variables: { targetId: number; newStatusEnum: MemberStatus }) =>
    walkAdminService.UpdateUserStatus({
      // eslint-disable-next-line camelcase
      user_id: variables.targetId,
      // eslint-disable-next-line camelcase
      walk_status: variables.newStatusEnum
    }),
  onSuccess: (_data, variables) => {
    showSuccessToast("状态更新成功");
    const targetMember = memberList.value.find((m) => m.id === variables.targetId);
    if (targetMember) {
      targetMember.status = variables.newStatusEnum;
    }
  },
  onError: (error) => {
    console.error("更新人员状态失败", error);
  }
});

/** 处理弹窗状态选择 */
const onSelectStatus = (action: ActionSheetAction & { value: MemberStatus }) => {
  const newStatusEnum = action.value;
  const targetId = currentEditId.value;

  if (!targetId) return;

  mutateUpdateStatus({
    targetId,
    newStatusEnum
  });
};

/** 绑定团队码 */
const handleBindTeam = async () => {
  if (!isCurrentTeamIdValid.value) {
    console.error("团队 ID 不合法");
    return;
  }

  try {
    await walkAdminService.BindTeamCode({
      // eslint-disable-next-line camelcase
      team_id: currentTeamId.value,
      content: "TEST_CODE_123"
    });
    showSuccessToast("绑定成功");
    fetchTeamData();
  } catch (error) {
    console.error("团队码绑定失败", error);
  }
};

/** 匹配状态对应颜色 */
const getStatusColor = (status: MemberStatus) => {
  if (status === "pending" || status === "inProgress") return "color-yellow-green";
  return "color-gray";
};
</script>

<style scoped lang="scss" src="./index.scss"></style>
