<!-- 默认布局组件 -->
<template>
  <div class="default-layout">
    <!-- 顶栏 -->
    <van-nav-bar
      v-if="!isNil(getNavbarTitleText)"
      :title="getNavbarTitleText"
      :left-arrow="props.showBack"
      :left-disabled="props.backDisabled"
      class="default-layout__navbar"
      @click-left="handleBackClick"
      @click-right="emit('clickNavbarRight')"
    >
      <template #right>
        <slot name="right" />
      </template>
    </van-nav-bar>
    <slot name="header" />
    <!-- 主内容区域 -->
    <loading-container class="default-layout__main" :loading="props.loading">
      <main class="default-layout__main__content">
        <slot />
      </main>
    </loading-container>
  </div>
</template>

<script setup lang="ts">
import "./index.scss";

import { isNil, last } from "lodash-es";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import loadingContainer from "@/components/loading-container/index.vue";

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
  /**
   * 是否显示返回上一页的按钮
   *
   * @default true
   */
  showBack?: boolean;
  /**
   * 是否禁用返回上一页的按钮
   *
   * @default false
   */
  backDisabled?: boolean;
  /**
   * 是否为整个主内容区域显示加载态
   *
   * @default false
   */
  loading?: boolean;
}

const props = withDefaults(defineProps<DefaultLayoutProps>(), {
  title: undefined,
  showNavbar: true,
  showBack: true,
  backDisabled: false
});

const emit = defineEmits<{
  /** 点击导航栏右侧插槽 */
  clickNavbarRight: [];
}>();

const router = useRouter();
const route = useRoute();

/** 获取导航栏标题文字 */
const getNavbarTitleText = computed(() => {
  const currentRouteMeta = last(route.matched)?.meta;

  if (!props.showNavbar || !currentRouteMeta) {
    return undefined;
  }

  // 允许页面设置空字符串, 顶栏展示空白
  return props.title ?? currentRouteMeta.pageName;
});

/** 点击返回上一页按钮 */
const handleBackClick = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    // 没有历史记录则返回首页
    router.replace({ name: "index" });
  }
};
</script>
