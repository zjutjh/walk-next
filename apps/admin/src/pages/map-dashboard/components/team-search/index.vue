<!-- 队伍搜索栏 与 搜索结果面板 -->
<template>
  <!-- 队伍搜索栏 -->
  <van-search
    v-model="searchValue"
    :class="styles.searchBar"
    :show-action="Boolean(searchValue.trim())"
    placeholder="搜索队伍ID 队长名/联系方式"
    input-align="center"
    shape="round"
    @search="handleSearchApply"
  >
    <template #action>
      <div :class="styles.searchBtn" @click="handleSearchApply">搜索</div>
    </template>
  </van-search>
  <!-- 搜索结果面板 -->
  <van-popup
    v-model:show="isResultPanelShow"
    :class="styles.searchResultPanel"
    :overlay="false"
    position="bottom"
    closeable
  >
    <template v-if="testTmpData.length === 1">
      <van-cell title="队伍ID">{{ testTmpData[0]?.id }}</van-cell>
      <van-cell title="队长姓名">{{ testTmpData[0]?.name }}</van-cell>
      <van-cell title="队长联系电话">{{ testTmpData[0]?.phone }}</van-cell>
      <van-cell title="队伍路线">{{ testTmpData[0]?.route }}</van-cell>
      <van-cell title="最新经过点位">{{ testTmpData[0]?.lastPoint }}</van-cell>
      <van-cell title="经过点位时间">{{
        dayjs(testTmpData[0]?.time).format("YYYY/MM/DD HH:mm")
      }}</van-cell>
      <van-cell title="获取队伍详细信息" is-link />
    </template>
    <van-collapse v-else v-model="selectedTeamId" :class="styles.searchResultList" accordion>
      <div v-for="team in testTmpData" :key="team.id" :class="styles.collapseWrapper">
        <van-collapse-item :name="team.id">
          <template #title>
            <van-cell
              v-show="selectedTeamId !== team.id"
              :title="[team.id, team.name, team.phone].join('、')"
            />
          </template>
          <van-cell title="队伍ID">{{ team.id }}</van-cell>
          <van-cell title="队长姓名">{{ team.name }}</van-cell>
          <van-cell title="队长联系电话">{{ team.phone }}</van-cell>
          <van-cell title="队伍路线">{{ team.route }}</van-cell>
          <van-cell title="最新经过点位">{{ team.lastPoint }}</van-cell>
          <van-cell title="经过点位时间">{{
            dayjs(team.time).format("YYYY/MM/DD HH:mm")
          }}</van-cell>
          <van-cell title="获取队伍详细信息" is-link />
        </van-collapse-item>
      </div>
    </van-collapse>
  </van-popup>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ref } from "vue";

import styles from "./index.module.scss";

const testTmpData = [
  // TODO: Tmp data
  {
    id: "123456",
    name: "张小明",
    phone: "19088880000",
    route: "屏峰全程",
    lastPoint: "老焦山",
    time: "2000-08-24T14:15:22.123Z"
  },
  {
    id: "234567",
    name: "李小华",
    phone: "19011111000",
    route: "屏峰半程",
    lastPoint: "老焦山",
    time: "2019-08-24T14:59:22.123Z"
  },
  {
    id: "345678",
    name: "王小强",
    phone: "19088222200",
    route: "莫干山",
    lastPoint: "浙江工业大学",
    time: "2019-08-24T11:15:22.123Z"
  },
  {
    id: "456789",
    name: "陈小亮",
    phone: "1933330000",
    route: "屏峰全程",
    lastPoint: "老焦山",
    time: "2019-08-23T14:15:22.123Z"
  },
  {
    id: "567890",
    name: "何小顺",
    phone: "1908866000",
    route: "屏峰全程",
    lastPoint: "老焦山",
    time: "2019-09-24T14:15:22.123Z"
  },
  {
    id: "678901",
    name: "钱多多",
    phone: "19088777700",
    route: "屏峰全程",
    lastPoint: "老焦山",
    time: "2020-08-24T14:15:22.123Z"
  }
];

/** 搜索输入框内容 */
const searchValue = ref("");

/** 搜索栏右侧是否显示取消按钮，若为false则显示搜索按钮 */
const isCancelShow = ref(false);

/** 搜索结果面板是否显示 */
const isResultPanelShow = ref(false);

/** 确定搜索 */
const handleSearchApply = () => {
  // 去除首尾空白
  searchValue.value = searchValue.value.trim();
  // 判空
  if (searchValue.value.length === 0) return;
  // 隐藏搜索，显示取消
  isCancelShow.value = true;
  // 显示搜索结果面板
  isResultPanelShow.value = true;
};

/** 当前展开的卡片的队伍ID */
const selectedTeamId = ref("");
</script>
