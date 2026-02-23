<template>
  <default-layout :show-navbar="false">
    <admin-info />
    <section :class="styles.main">
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link />
        <van-cell title="输入签到" is-link />
      </van-cell-group>

      <van-cell-group title="起终点人员管理">
        <van-cell title="单人登记" is-link />
        <van-cell title="团队信息页" is-link to="/team-list" />
        <van-cell title="重组队伍" is-link to="/team-rebuild" />
        <div :class="styles.functionButtonContainer">
          <van-button type="primary" plain :class="styles.functionButton" block>
            待出发→进行中
          </van-button>
          <van-button type="primary" plain :class="styles.functionButton" block>
            直接提交队伍
          </van-button>
        </div>
      </van-cell-group>

      <van-cell-group title="数据大盘">
        <van-cell title="屏峰地图可视化" is-link />
        <van-cell title="莫干山地图可视化" is-link />
        <van-cell title="表格数据查看" is-link />
      </van-cell-group>
    </section>
  </default-layout>
</template>

<script setup lang="ts">
import DefaultLayout from "@/layouts/default-layout/index.vue";

import AdminInfo from "./components/admin-info/index.vue";
import styles from "./index.module.scss";
</script>
