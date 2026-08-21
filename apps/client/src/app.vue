<template>
  <error-boundary>
    <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
  </error-boundary>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";

const route = useRoute();
</script>
