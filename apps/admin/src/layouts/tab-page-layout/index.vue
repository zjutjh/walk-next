<template>
  <main>
    <slot />
  </main>
  <footer>
    <app-tabbar />
  </footer>
</template>

<script setup lang="ts">
import AppTabbar from "./components/app-tabbar/index.vue";
import { useTitleMeta } from "./composables/use-title-meta";

useTitleMeta();
</script>
