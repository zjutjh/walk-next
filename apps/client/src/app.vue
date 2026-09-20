<template>
  <error-boundary>
    <component :is="layoutComponent" v-bind="route.meta.layout?.props ?? {}">
      <router-view :key="route.meta.recreateComponentByPath ? route.fullPath : undefined" />
      <router-view v-slot="{ Component: NavBar }" name="navbar">
        <transition name="navbar">
          <component :is="NavBar" v-if="NavBar" />
        </transition>
      </router-view>
    </component>

    <confirm-dialog />
  </error-boundary>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { type Component, computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";

import ConfirmDialog from "@/components/confirm-dialog/index.vue";
import ErrorBoundary from "@/components/error-boundary/index.vue";
import { useClientUserData, useTitleMeta } from "@/composables";
import DefaultLayout from "@/layouts/default-layout/index.vue";
import { scrollToHash } from "@/utils";

const route = useRoute();
const { setupClientUserDataQuery } = useClientUserData();

const layoutComponent = computed<Component>(() => {
  const layout = route.meta.layout?.component;
  if (!layout) return DefaultLayout;
  if (typeof layout === "function")
    return defineAsyncComponent(layout as () => Promise<{ default: Component }>);
  return layout;
});

useEventListener(document, "click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!link) return;

  const hash = link.getAttribute("href");
  if (!hash) return;

  event.preventDefault();
  history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
  scrollToHash(hash, { behavior: "smooth" });
});

useTitleMeta();
setupClientUserDataQuery();
</script>
