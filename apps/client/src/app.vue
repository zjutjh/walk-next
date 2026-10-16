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
  </error-boundary>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { type Component, computed, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";

import ErrorBoundary from "@/components/error-boundary/index.vue";
import { setupClientNoticeQuery, useClientUserData, useTitleMeta } from "@/composables";
import { DefaultLayout, layouts } from "@/layouts/registry";
import { scrollToHash } from "@/utils";

const route = useRoute();
const { setupClientUserDataQuery } = useClientUserData();

const layoutComponent = computed<Component>(() => {
  const name = route.meta.layout?.name ?? "default-layout";
  if (name === "default-layout") return DefaultLayout;
  return defineAsyncComponent(layouts[name]);
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
setupClientNoticeQuery();
</script>
