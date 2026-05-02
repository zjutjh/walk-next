<template>
  <default-layout title="精弘毅行管理后台" :show-back="false">
    <admin-info />
    <section :class="styles.main">
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link />
        <van-cell title="输入签到" is-link />
      </van-cell-group>

      <van-cell-group title="数据大盘">
        <van-cell
          v-for="campusId in CAMPUS_LIST"
          :key="campusId"
          :title="`${CAMPUS_CONFIG[campusId].text}可视化地图`"
          is-link
          :to="`/dashboard/${campusId}`"
        />
        <van-cell title="数据表格" is-link />
      </van-cell-group>

      <van-cell-group title="人员管理">
        <van-cell title="重组队伍" is-link to="/team-rebuild" />
        <div :class="styles.functionButtonContainer">
          <van-button type="primary" :class="styles.functionButton" block>
            待出发→进行中
          </van-button>
        </div>
      </van-cell-group>
    </section>
  </default-layout>
</template>

<script setup lang="ts">
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { CAMPUS_CONFIG, CAMPUS_LIST } from "@/walk-config";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";
</script>
