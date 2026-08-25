<template>
  <app-shell>
    <error-boundary>
      <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
      <router-view v-slot="{ Component }" name="navbar">
        <transition name="navbar">
          <component :is="Component" v-if="Component" />
        </transition>
      </router-view>
    </error-boundary>
  </app-shell>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useClientUserData, useTitleMeta } from "@/composables";
import AppShell from "@/layouts/app-shell/index.vue";

const route = useRoute();
const { setupClientUserDataQuery } = useClientUserData();

useTitleMeta();
setupClientUserDataQuery();
</script>
