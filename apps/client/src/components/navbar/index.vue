<template>
  <div ref="wrapRef" class="bottom-nav-wrap">
    <van-tabbar route :border="false" class="bottom-nav" safe-area-inset-bottom>
      <van-tabbar-item v-for="item in tabItems" :key="item.to" replace :to="item.to">
        <div class="bottom-nav-item">
          <img :src="item.icon" :alt="item.label" class="bottom-nav-item__icon" />
          <span class="bottom-nav-item__text">{{ $t(item.label) }}</span>
        </div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import "./index.scss";

import { useResizeObserver } from "@vueuse/core";
import { computed, onBeforeUnmount, useTemplateRef } from "vue";

import fingerHeartIcon from "@/assets/images/finger-heart.png";
import proudIcon from "@/assets/images/proud.png";
import thumbsUpIcon from "@/assets/images/thumbs-up.png";

/** 视觉缓冲：激活图标向上放大的溢出量与阴影呼吸空间 */
const NAVBAR_CLEARANCE_BUFFER_PX = 27;

const wrapRef = useTemplateRef<HTMLElement>("wrapRef");

// 向根元素申报避让空间（实测高度 + 视觉缓冲 + 底部安全区），
// 由 app-shell 的内容容器统一消费，页面自身无需感知悬浮导航
useResizeObserver(wrapRef, ([entry]) => {
  if (!entry) return;
  const height = Math.ceil(entry.target.getBoundingClientRect().height);
  document.documentElement.style.setProperty(
    "--navbar-space",
    `calc(${height}px + ${NAVBAR_CLEARANCE_BUFFER_PX}px + env(safe-area-inset-bottom, 0px))`
  );
});

onBeforeUnmount(() => {
  document.documentElement.style.removeProperty("--navbar-space");
});

const tabItems = computed(() => [
  {
    to: "/profile",
    label: "profile",
    icon: thumbsUpIcon
  },
  {
    to: "/team",
    label: "team.info",
    icon: fingerHeartIcon
  },
  {
    to: "/settings",
    label: "settings",
    icon: proudIcon
  }
]);
</script>
