<template>
  <van-cell-group title="管理员信息">
    <van-cell title="管理员">{{ adminName }}</van-cell>
    <van-cell title="点位">{{ walkPoint }}</van-cell>
  </van-cell-group>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    adminName?: string;
    walkPoint?: string;
  }>(),
  {
    adminName: "-",
    walkPoint: "-"
  }
);
</script>
