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
import { computed, ref } from "vue";

import DefaultLayout from "@/layouts/default-layout/index.vue";

const teamRoute = ref("屏峰全程");
const prevPoint = ref("慈母桥");

// 定义成员状态类型
type MemberStatus = "未开始" | "待出发" | "已放弃" | "进行中";

interface Member {
  id: number;
  name: string;
  status: MemberStatus;
}

const memberList = ref<Member[]>([
  { id: 1, name: "白糖洒一地", status: "待出发" },
  { id: 2, name: "SugarMGP", status: "未开始" },
  { id: 3, name: "mgg", status: "待出发" },
  { id: 4, name: "猫家军", status: "待出发" },
  { id: 5, name: "折乙", status: "待出发" }
]);

// 1. 自动计算剩余人数 (总人数扣除已放弃的)
const remainingCount = computed(() => {
  return memberList.value.filter((m) => m.status !== "已放弃").length;
});

// 2. 状态选择弹窗逻辑
const showPicker = ref(false);
const currentEditId = ref<number | null>(null);

// 起点修改状态选项（根据要求只有这两种）
const statusOptions = [{ name: "待出发" }, { name: "已放弃" }];

const openStatusPicker = (id: number) => {
  currentEditId.value = id;
  showPicker.value = true;
};

const onSelectStatus = (action: { name: string }) => {
  const targetMember = memberList.value.find((m) => m.id === currentEditId.value);
  if (targetMember) {
    targetMember.status = action.name as MemberStatus;
  }
};

// 3. 团队码绑定逻辑
const handleBindTeam = () => {
  showSuccessToast("绑定成功");
  // 绑定后，把“待出发”的改成“进行中”
  memberList.value.forEach((member) => {
    if (member.status === "待出发") {
      member.status = "进行中";
    }
  });
};

// --- 辅助工具函数：控制不同状态的颜色 ---
const getStatusColor = (status: MemberStatus) => {
  if (status === "待出发" || status === "进行中") {
    return "color-yellow-green";
  }
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
