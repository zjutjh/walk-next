<template>
  <div :class="styles.layoutContainer">
    <van-nav-bar
      v-if="title"
      :title="title"
      left-arrow
      :class="styles.navBar"
      @click-left="handleBackClick"
    />
    <slot name="header" />
    <main
      :class="styles.layoutMain"
      :style="{
        overflowY: scroll ? 'auto' : 'hidden'
      }"
    >
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useTitleMeta } from "./composables/use-title-meta";
import styles from "./index.module.scss";

interface Props {
  title?: string;
  scroll?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  scroll: true
});
const router = useRouter();
const route = useRoute();

const handleBackClick = () => {
  // 若无历史记录，则返回首页 (如直接访问了一个非首页的链接, 然后点NavBar的返回按钮)
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.replace("/");
  }
};

useTitleMeta();

const title = computed(() => {
  if (props.title) {
    return props.title;
  }
  // 获取当前路由的 meta 中的 title (如果没有 则不展示nav-bar, 如首页就不展示)
  const currentRoute = route.matched[route.matched.length - 1];
  return currentRoute?.meta.title as string | undefined;
});
</script>
