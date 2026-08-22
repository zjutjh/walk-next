<template>
  <error-boundary>
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
  </error-boundary>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useClientUserData, useTitleMeta } from "@/composables";

const route = useRoute();
const { setupClientUserDataQuery } = useClientUserData();

useTitleMeta();
setupClientUserDataQuery();
</script>
