<template>
  <div class="default-layout">
    <van-nav-bar
      v-if="!isNil(navbarTitle)"
      :title="navbarTitle"
      left-arrow
      class="default-layout__navbar"
      @click-left="handleBackClick"
    />
    <slot name="header" />
    <main class="default-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import "./index.scss";

import { isNil, last } from "lodash-es";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useTitleMeta } from "@/composables/use-title-meta";

interface DefaultLayoutProps {
  /**
   * 自定义顶栏标题文案
   *
   * @default pageName
   */
  title?: string;
  /**
   * 是否展示顶栏，需要结合 `title` 一起使用
   *
   * @default true
   */
  showNavbar?: boolean;
}

const props = withDefaults(defineProps<DefaultLayoutProps>(), {
  title: undefined,
  showNavbar: true
});

useTitleMeta();

const router = useRouter();
const route = useRoute();

const navbarTitle = computed(() => {
  const currentRouteMeta = last(route.matched)?.meta;

  if (!props.showNavbar || !currentRouteMeta) {
    return undefined;
  }

  // 允许页面设置空字符串, 顶栏展示空白
  return props.title ?? currentRouteMeta.pageName;
});

const handleBackClick = () => {
  // 直接打开页面可能没有历史记录，兜底返回首页
  if (router.options.history.state.back) {
    router.back();
  } else {
    router.replace("/");
  }
};
</script>
