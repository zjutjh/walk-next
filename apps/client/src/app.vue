<template>
  <error-boundary>
    <component
      :is="route.meta.layout?.component ?? DefaultLayout"
      v-bind="route.meta.layout?.props ?? {}"
    >
      <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
      <router-view v-slot="{ Component }" name="navbar">
        <transition name="navbar">
          <component :is="Component" v-if="Component" />
        </transition>
      </router-view>
    </component>

    <confirm-dialog />
  </error-boundary>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";

import ConfirmDialog from "@/components/confirm-dialog/index.vue";
import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useClientUserData, useTitleMeta } from "@/composables";
import DefaultLayout from "@/layouts/default-layout/index.vue";

const route = useRoute();
const router = useRouter();
const { setupClientUserDataQuery } = useClientUserData();

useEventListener(document, "click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;

  const hash = link.getAttribute("href");
  const targetElement = hash && document.getElementById(hash.slice(1));
  if (!targetElement) return;

  event.preventDefault();
  router.replace({ hash });
  targetElement.scrollIntoView();
});

useTitleMeta();
setupClientUserDataQuery();
</script>
