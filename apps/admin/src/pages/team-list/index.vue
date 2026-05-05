<template>
  <!-- index页的PR测试用的page 回头直接删掉 -->
  <default-layout title="团队信息">
    <div class="team-list-placeholder">
      <p>团队信息页开发中</p>
      <p v-if="teamId">team_id: {{ teamId }}</p>
      <p v-if="campusId">campus: {{ campusId }}</p>
    </div>
  </default-layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import DefaultLayout from "@/layouts/default-layout/index.vue";

const route = useRoute();

const campusId = computed(() => route.params.campusId as string | undefined);
const teamId = computed(() => route.query.team_id as string | undefined);
</script>

<style scoped>
.team-list-placeholder {
  padding: 16px;
  color: #666;
  font-size: 14px;
}
</style>
