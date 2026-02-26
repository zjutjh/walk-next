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
            <span :class="getStatusColor(member.status)">{{ member.status }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="btn-wrap">
        <van-button class="bind-btn" block @click="handleBindTeam"> 团队码绑定 </van-button>
      </div>
    </div>

    <van-action-sheet
      v-model:show="showPicker"
      :actions="statusOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectStatus"
    />
  </default-layout>
</template>

<script setup lang="ts">
import { showSuccessToast } from "vant";
import { computed, onMounted, ref } from "vue";

import DefaultLayout from "@/layouts/default-layout/index.vue";
import { walkAdminService } from "@/utils/service";

const teamRoute = ref("");
const prevPoint = ref("");
// 这里写死 team_id 为 1 用来做开发测试，后续扫码页面做好了，这里换成从路由获取
const currentTeamId = 1;

type MemberStatus = "未开始" | "待出发" | "已放弃" | "进行中";

interface Member {
  id: number;
  name: string;
  status: MemberStatus;
}

const memberList = ref<Member[]>([]);

const remainingCount = computed(() => {
  return memberList.value.filter((m) => m.status !== "已放弃").length;
});

// --- 状态中英翻译器 ---
const statusMapToZh: Record<string, MemberStatus> = {
  notStart: "未开始",
  pending: "待出发",
  abandoned: "已放弃",
  inProgress: "进行中"
};
const statusMapToEn: Record<MemberStatus, string> = {
  未开始: "notStart",
  待出发: "pending",
  已放弃: "abandoned",
  进行中: "inProgress"
};

// 1. 初始化获取数据
const fetchTeamData = async () => {
  try {
    const res = await walkAdminService.QueryTeamStatus({ team_id: currentTeamId });
    // 删掉原来的 if (res) {
    if (res.team) {
      teamRoute.value = res.team.route_name;
      prevPoint.value = res.team.prev_point_name;
    }
    if (res.member) {
      memberList.value = res.member.map((m) => ({
        id: m.user_id,
        name: m.name,
        status: statusMapToZh[m.walk_status] || "未开始"
      }));
    }
    // 删掉原来的 }
  } catch (error) {
    console.error("获取团队状态失败", error);
  }
};

onMounted(() => {
  fetchTeamData();
});

// 2. 状态选择弹窗逻辑
const showPicker = ref(false);
const currentEditId = ref<number | null>(null);
const statusOptions = [{ name: "待出发" }, { name: "已放弃" }];

const openStatusPicker = (id: number) => {
  currentEditId.value = id;
  showPicker.value = true;
};

const onSelectStatus = async (action: { name: string }) => {
  const newStatusZh = action.name as MemberStatus;
  const targetId = currentEditId.value;
  if (!targetId) return;

  try {
    // 调用接口更新状态
    await walkAdminService.UpdateUserStatus({
      user_id: targetId,
      walk_status: statusMapToEn[newStatusZh]
    });

    // 如果没有报错走进 catch，说明成功了
    showSuccessToast("状态更新成功");
    const targetMember = memberList.value.find((m) => m.id === targetId);
    if (targetMember) targetMember.status = newStatusZh;
  } catch (error) {
    console.error("更新人员状态失败", error);
  }
};

// 3. 团队码绑定逻辑
const handleBindTeam = async () => {
  try {
    await walkAdminService.BindTeamCode({
      team_id: currentTeamId,
      content: "TEST_CODE_123" // 测试签到码
    });

    showSuccessToast("绑定成功");
    fetchTeamData(); // 重新拉取数据刷新状态
  } catch (error) {
    console.error("团队码绑定失败", error);
  }
};

const getStatusColor = (status: MemberStatus) => {
  if (status === "待出发" || status === "进行中") return "color-yellow-green";
  return "color-gray";
};
</script>

<style scoped>
/* 整体背景 */
.page-container {
  min-height: calc(100vh - 46px);
  background-color: #fdf5f4;
  padding: 16px 0; /* 上下留白，左右由 inset 卡片自带 */
}

/* 顶部卡片底部间距 */
.top-card {
  margin-bottom: 24px;
}

/* 覆盖 Vant 右侧 value 的文字颜色为设计图的粉红色 */
:deep(.highlight-value) {
  color: #f0747b !important;
  font-weight: 500;
}

/* 中间“成员状态”标题 */
.section-title {
  padding: 0 32px 8px;
  font-size: 14px;
  color: #999;
}

/* 成员列表距底部的空间 */
.member-list {
  margin-bottom: 40px;
}

/* 状态文字颜色 */
.color-yellow-green {
  color: #9ecb3c; /* 匹配设计图的黄绿色 */
}
.color-gray {
  color: #666; /* 匹配设计图的深灰色 */
}

/* 底部按钮外层容器 */
.btn-wrap {
  padding: 0 16px;
}

/* 实心按钮自定义颜色 */
:deep(.bind-btn) {
  background-color: #f0747b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
}

/* 稍微增大一下单元格的高度让它看起来更舒展 */
:deep(.van-cell) {
  padding: 16px;
}
</style>
