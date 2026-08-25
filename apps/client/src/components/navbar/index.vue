<template>
  <div class="bottom-nav-wrap">
    <van-tabbar route safe-area-inset-bottom :border="false" class="bottom-nav">
      <van-tabbar-item
        v-for="item in tabItems"
        :key="item.to"
        replace
        :to="item.to"
        class="bottom-nav-tab"
      >
        <div class="bottom-nav-item">
          <img :src="item.icon" :alt="item.label" class="bottom-nav-item__icon" />
          <span class="bottom-nav-item__text">{{ item.label }}</span>
        </div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import fingerHeartIcon from "@/assets/images/finger-heart.png";
import proudIcon from "@/assets/images/proud.png";
import thumbsUpIcon from "@/assets/images/thumbs-up.png";

const { t } = useI18n();

const tabItems = computed(() => [
  {
    to: "/profile",
    label: t("profile"),
    icon: thumbsUpIcon
  },
  {
    to: "/team",
    label: t("team.info"),
    icon: fingerHeartIcon
  },
  {
    to: "/settings",
    label: t("settings"),
    icon: proudIcon
  }
]);
</script>

<style scoped>
.bottom-nav-wrap {
  position: fixed;
  z-index: 120;
  left: 50%;
  right: auto;
  bottom: 9px;
  width: calc(100% - 16px);
  max-width: 520px;
  transform: translateX(-50%);
  pointer-events: none;
  /* 不裁剪：item 阴影和放大图标都可自由溢出 */
}

/* 显隐动画（由 app.vue 中 <transition name="navbar"> 触发） */
.navbar-enter-active,
.navbar-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.navbar-enter-from,
.navbar-leave-to {
  transform: translateX(-50%) translateY(calc(100% + 9px));
  opacity: 0;
}

.navbar-leave-active {
  pointer-events: none;
}

.navbar-leave-active :deep(.bottom-nav) {
  pointer-events: none;
}

.bottom-nav {
  pointer-events: auto;
  height: auto;
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgb(206 224 166 / 88%) 0%, rgb(197 220 153 / 82%) 100%);
  box-shadow: 0 5px 14px rgb(62 87 28 / 16%);
  backdrop-filter: blur(2px);
}

:deep(.bottom-nav.van-tabbar) {
  position: static;
  inset: auto;
  box-sizing: border-box;
  width: 100%;
  /* 用 gap 代替 item 的 margin：首尾无外边距，tabbar 天然不溢出父容器 */
  gap: 10px;
  border-top: 0;
}

:deep(.bottom-nav .van-tabbar-item) {
  flex: 1;
  min-width: 0;
  min-height: 28px;
  margin: 0;
  padding: 0 2px;
  overflow: visible;
  border-radius: 8px;
  background: #fff;
  color: #2a2f26;
  box-shadow: 0 2px 6px rgb(43 56 22 / 12%);
}

:deep(.bottom-nav .van-tabbar-item--active) {
  background: #fff;
  box-shadow: 0 4px 10px rgb(43 56 22 / 20%);
}

:deep(.bottom-nav .van-tabbar-item__icon) {
  display: none;
}

:deep(.bottom-nav .van-tabbar-item__text) {
  margin-top: 0;
  width: 100%;
  height: 100%;
  color: inherit;
  overflow: visible;
}

:deep(.bottom-nav .bottom-nav-tab .van-tabbar-item__text) {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

:deep(.bottom-nav .van-tabbar-item--active .bottom-nav-item) {
  color: #20251f;
}

.bottom-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 40px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.05;
  color: inherit;
  white-space: nowrap;
  overflow: visible;
}

.bottom-nav-item__icon {
  display: block;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  object-fit: contain;
  transform-origin: 50% 100%;
  transition:
    transform 300ms cubic-bezier(0.2, 0.95, 0.22, 1),
    filter 300ms cubic-bezier(0.2, 0.95, 0.22, 1);
  will-change: transform;
  overflow: visible;
}

.bottom-nav-item__text {
  letter-spacing: 0.01em;
  transform: translateY(0) scale(1);
  transform-origin: center center;
  transition: transform 300ms cubic-bezier(0.2, 0.95, 0.22, 1);
}

:deep(.bottom-nav .van-tabbar-item--active .bottom-nav-item__icon) {
  transform: scale(2);
  filter: drop-shadow(0 4px 6px rgb(34 50 18 / 22%));
}

:deep(.bottom-nav .van-tabbar-item--active .bottom-nav-item__text) {
  transform: translateY(0) scale(1.12);
}

@media (max-width: 360px) {
  .bottom-nav-wrap {
    width: calc(100% - 12px);
  }

  .bottom-nav-item {
    height: 26px;
    font-size: 11px;
    gap: 3px;
  }

  .bottom-nav-item__icon {
    width: 15px;
    height: 15px;
  }

  :deep(.bottom-nav .van-tabbar-item--active .bottom-nav-item__icon) {
    transform: scale(2.2);
  }
}
</style>
