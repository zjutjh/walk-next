<template>
  <default-layout>
    <div class="page-container">
      <van-cell-group inset class="custom-card top-card">
        <van-cell title="队伍路线" :value="teamRoute" value-class="highlight-value" />
        <van-cell title="队伍剩余人数" :value="remainingCount" value-class="highlight-value" />
        <van-cell title="上一点位" :value="prevPoint" value-class="highlight-value" />
      </van-cell-group>

      <div class="section-title">成员状态</div>

      <van-cell-group inset class="custom-card member-list">
        <van-cell
          v-for="member in memberList"
          :key="member.id"
          :title="member.name"
          is-link
          @click="openStatusPicker(member.id)"
        >
          <template #value>
            <!-- 仅在渲染时，将底层的 status 枚举转换为中文显示 -->
            <span :class="getStatusColor(member.status)">
              {{ TEAM_STATUS_MAP[member.status] }}
            </span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="btn-wrap">
        <van-button class="bind-btn" block @click="handleBindTeam"> 团队码绑定 </van-button>
      </div>
    </div>

    <van-action-sheet
      v-model:show="showPicker"
      :actions="STATUS_OPTIONS"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectStatus"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { computed, onMounted, ref } from "vue";

import { DEV_TEAM_ID, type MemberStatus, STATUS_OPTIONS, TEAM_STATUS_MAP } from "@/constants/team";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils/service";

/** 队伍路线 */
const teamRoute = ref("");

/** 上一点位 */
const prevPoint = ref("");

/** 当前团队 ID */
const currentTeamId = DEV_TEAM_ID;

/** 团队成员数据结构 */
interface Member {
  id: number;
  name: string;
  status: MemberStatus;
}

/** 成员列表数据 (严格存储为 MemberStatus 枚举) */
const memberList = ref<Member[]>([]);

/** 动态计算剩余人数（直接使用枚举值判断） */
const remainingCount = computed(() => {
  return memberList.value.filter((m) => m.status !== "abandoned").length;
});

/** 获取团队基础信息与成员状态 */
const fetchTeamData = async () => {
  try {
    const res = await walkAdminService.QueryTeamStatus({ team_id: currentTeamId });
    if (res.team) {
      teamRoute.value = res.team.route_name;
      prevPoint.value = res.team.prev_point_name;
    }
    if (res.member) {
      memberList.value = res.member.map((m) => ({
        id: m.user_id,
        name: m.name,
        // 假设后端返回的数据字段也是对应的枚举字符串，如果为空则默认 notStart
        status: (m.walk_status || "notStart") as MemberStatus
      }));
    }
  } catch (error) {
    console.error("获取团队状态失败", error);
  }
};

onMounted(() => {
  fetchTeamData();
});

/** 状态选择弹窗显示控制 */
const showPicker = ref(false);

/** 当前正在编辑的成员 ID */
const currentEditId = ref<number | null>(null);

/** 打开指定成员的状态选择弹窗 */
const openStatusPicker = (id: number) => {
  currentEditId.value = id;
  showPicker.value = true;
};

/** 处理弹窗状态选择与接口更新 */
const onSelectStatus = async (action: { name: string; value: MemberStatus }) => {
  // 直接提取我们预先绑定在 options 里的 value 枚举
  const newStatusEnum = action.value;
  const targetId = currentEditId.value;
  if (!targetId) return;

  try {
    // 接口传参也变得极其干净，直接传枚举
    await walkAdminService.UpdateUserStatus({
      user_id: targetId,
      walk_status: newStatusEnum
    });

    showSuccessToast("状态更新成功");
    const targetMember = memberList.value.find((m) => m.id === targetId);
    if (targetMember) targetMember.status = newStatusEnum;
  } catch (error) {
    console.error("更新人员状态失败", error);
  }
};

/** 绑定团队签到码 */
const handleBindTeam = async () => {
  try {
    await walkAdminService.BindTeamCode({
      team_id: currentTeamId,
      content: "TEST_CODE_123"
    });

    showSuccessToast("绑定成功");
    fetchTeamData();
  } catch (error) {
    console.error("团队码绑定失败", error);
  }
};

/** 获取状态对应的 CSS 颜色类名 (直接判断枚举) */
const getStatusColor = (status: MemberStatus) => {
  if (status === "pending" || status === "inProgress") {
    return "color-yellow-green";
  }
  return "color-gray";
};
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - 46px);
  background-color: #fdf5f4;
  padding: 16px 0;
}

.top-card {
  margin-bottom: 24px;
}

:deep(.highlight-value) {
  color: #f0747b !important;
  font-weight: 500;
}

.section-title {
  padding: 0 32px 8px;
  font-size: 14px;
  color: #999;
}

.member-list {
  margin-bottom: 40px;
}

.color-yellow-green {
  color: #9ecb3c;
}

.color-gray {
  color: #666;
}

.btn-wrap {
  padding: 0 16px;
}

:deep(.bind-btn) {
  background-color: #f0747b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
}

:deep(.van-cell) {
  padding: 16px;
}
</style>
