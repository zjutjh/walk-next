<template>
  <default-layout>
    <section :class="styles['admin-info']">
      <div :class="styles['admin-info-font']">
        <span :class="styles['key']">路线:</span>
        <span :class="styles['value']">{{ walkRoute }}</span>
      </div>
      <div :class="styles['admin-info-font']">
        <span :class="styles['key']">点位:</span>
        <span :class="styles['value']">{{ walkPoint }}</span>
      </div>
    </section>

    <section :class="styles['main']">
      <van-cell-group title="签到">
        <van-cell title="扫码签到" is-link />
        <van-cell title="输入签到" is-link />
      </van-cell-group>

      <van-cell-group title="起终点人员管理">
        <van-cell title="单人登记" is-link />
        <van-cell title="重组队伍" is-link url="/team-rebuild" />
        <div :class="styles['function-button-container']">
          <van-button type="primary" plain :class="styles['function-button']" block>
            待出发→进行中
          </van-button>
          <van-button type="primary" plain :class="styles['function-button']" block>
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

    <footer :class="styles['admin-name']">
      <span :class="styles['key']">管理员:</span>
      <span :class="styles['value']">{{ adminName }}</span>
      <div class="van-safe-area-bottom"></div>
    </footer>
  </default-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";

import DefaultLayout from "@/layouts/default-layout/index.vue";

import styles from "./index.module.scss";
const walkRoute = ref("屏峰全程");
const walkPoint = ref("XXX");
const adminName = ref("XXX");
</script>
