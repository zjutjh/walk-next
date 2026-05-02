<!-- 数据新鲜度 支持手动刷新数据 -->
<template>
  <div :class="styles.component">
    <ic-outline-info :class="styles.icon" />
    <div :class="styles.freshnessText">
      数据每 {{ props.refreshInterval }} 秒自动更新一次
      <!-- 更新时间提示 -->
      <div v-show="!props.isError && props.dataUpdatedAt > 0" :class="styles.updateTime">
        ，上次更新于&nbsp;{{ dayjs(props.dataUpdatedAt).format("YYYY/M/D HH:mm:ss") }}
      </div>
      <!-- 失败提示 -->
      <template v-if="props.isError">
        <div v-if="props.isFetching" :class="styles.retryingTip">正在重新连接服务器</div>
        <div v-else class="van-haptics-feedback" :class="styles.errorTip" @click="handleRefresh">
          数据获取失败，请点击重试
        </div>
      </template>
    </div>
    <!-- 刷新按钮/加载态 -->
    <van-loading v-if="props.isFetching" :class="styles.refreshLoading" />
    <ic-outline-autorenew
      v-else
      class="van-haptics-feedback"
      :class="styles.refreshBtn"
      @click="handleRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

import IcOutlineAutorenew from "~icons/ic/outline-autorenew";
import IcOutlineInfo from "~icons/ic/outline-info";

import styles from "./index.module.scss";

const props = defineProps<{
  /** 显示的自动刷新间隔（秒） */
  refreshInterval: number;
  /** 上次更新时间戳 */
  dataUpdatedAt: number;
  /** 是否正在拉取数据中 */
  isFetching: boolean;
  /** 是否请求错误 */
  isError: boolean;
}>();

const emit = defineEmits<{
  /** 要求父组件刷新数据 */
  refresh: [];
}>();

/** 手动刷新数据 */
const handleRefresh = () => {
  emit("refresh");
};
</script>
