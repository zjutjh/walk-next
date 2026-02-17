<template>
  <!-- 此处layout-container设置了min-height:100vh, 避免内容过少时背景色无法完全覆盖 -->
  <div :class="styles['layout-container']">
    <van-nav-bar
      v-if="title"
      :title="title"
      left-arrow
      :class="styles['nav-bar']"
      @click-left="handleBackClick"
    />
    <main :class="styles['layout-main']">
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
}

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

const handleBackClick = () => {
  router.back();
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
