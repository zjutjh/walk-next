<template>
  <div :class="styles.page">
    <language-switcher />

    <div :class="styles.content">
      <h1 :class="styles.title">{{ $t("请选择您的身份") }}</h1>

      <div :class="styles.cardList">
        <button
          v-for="(option, index) in identityOptions"
          :key="option.route"
          type="button"
          :class="styles.card"
          :style="{ viewTransitionName: cardViewName(option.route, index) }"
          @click="() => leave(option.route, option.route)"
        >
          <component :is="option.icon" :class="styles.cardIcon" aria-hidden="true" />
          <span :class="styles.cardName">{{ $t(option.name) }}</span>
          <van-loading
            v-if="leavingRoute === option.route"
            :class="styles.cardSpinner"
            size="20"
            color="#8a6136"
          />
          <van-icon :class="styles.cardArrow" name="arrow" />
        </button>
      </div>

      <button type="button" :class="styles.loginLink" @click="() => leave('login', null)">
        {{ $t("已有账号？去登录") }}
      </button>

      <icp-record fixed />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion, useSupported } from "@vueuse/core";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import IcpRecord from "@/components/icp-record/index.vue";
import LanguageSwitcher from "@/components/language-switcher/index.vue";
import IcOutlineHandshake from "~icons/ic/outline-handshake";
import IcOutlineSchool from "~icons/ic/outline-school";
import IcOutlineSupervisorAccount from "~icons/ic/outline-supervisor-account";

import styles from "./index.module.scss";

const route = useRoute();
const router = useRouter();
const preferredMotion = usePreferredReducedMotion();

const isLeaving = ref(false);
const leavingRoute = ref<string | null>(null);
const isVTSupported = useSupported(() => "startViewTransition" in document);

const identityOptions = [
  { name: "学生", route: "register-student", icon: IcOutlineSchool },
  { name: "教职工", route: "register-teacher", icon: IcOutlineSupervisorAccount },
  { name: "校友", route: "register-alumni", icon: IcOutlineHandshake }
];

const cardViewName = (target: string, index: number) => {
  if (leavingRoute.value === null) return `register-drop-${index}`;
  return target === leavingRoute.value ? "register-lead" : `register-follow-${index}`;
};

const leave = async (name: string, lead: string | null) => {
  if (lead === null) return router.replace({ name, query: route.query });
  if (isLeaving.value) return;
  isLeaving.value = true;
  leavingRoute.value = lead;
  try {
    const loader = router.resolve({ name }).matched.at(-1)?.components?.default;
    if (typeof loader === "function") await (loader as () => Promise<unknown>)();
    await ((func: () => Promise<unknown>) => {
      if (isVTSupported.value && preferredMotion.value === "no-preference")
        return document.startViewTransition(func).finished;
      return func();
    })(() => router.replace({ name, query: route.query }));
  } catch {
    isLeaving.value = false;
    leavingRoute.value = null;
  }
};
</script>
