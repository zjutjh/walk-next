<!-- 数据拉取失败提示 -->
<template>
  <van-notice-bar :class="styles.component" mode="closeable">
    <ic-outline-info :class="styles.icon" />
    <div :class="styles.tip">数据获取失败，请下拉重试</div>
    <div v-if="props.dataUpdatedAt > 0" :class="styles.updateTime">
      上次更新于{{ dayjs(props.dataUpdatedAt).format("HH:mm:ss") }}
    </div>
  </van-notice-bar>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

import IcOutlineInfo from "~icons/ic/outline-info";

import styles from "./index.module.scss";

const props = defineProps<{
  /** 上次更新时间戳 */
  dataUpdatedAt: number;
}>();
</script>
