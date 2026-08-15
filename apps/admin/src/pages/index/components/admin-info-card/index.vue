<!-- 管理员信息卡片 -->
<template>
  <van-cell-group title="管理员信息">
    <van-cell title="管理员">{{ adminUserInfo?.adminName || "-" }}</van-cell>
    <van-cell title="点位">{{
      (adminUserInfo && POINT_CONFIG[adminUserInfo.pointId]?.text) || "-"
    }}</van-cell>
  </van-cell-group>
</template>

<script setup lang="ts">
import { useAdminUserData } from "@/composables";
import { POINT_CONFIG } from "@/walk-config";

const { adminUserInfo } = useAdminUserData();
</script>
