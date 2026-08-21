<template>
  <error-boundary>
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
  </error-boundary>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useClientUserData } from "@/composables";
const { setupClientUserDataQuery } = useClientUserData();
setupClientUserDataQuery();
const route = useRoute();
</script>
