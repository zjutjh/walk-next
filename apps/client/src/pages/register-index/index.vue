<template>
  <div>
    <language-switcher />

    <div
      :class="[
        styles.content,
        leavingMode === 'forward' && styles.leavingForward,
        leavingMode === 'backward' && styles.leavingBackward
      ]"
    >
      <h1 :class="styles.title">{{ $t("请选择您的身份") }}</h1>

      <div :class="styles.cardList">
        <button
          v-for="option in identityOptions"
          :key="option.route"
          type="button"
          :class="[styles.card, leavingRoute === option.route && styles.cardLeading]"
          @click="goRegister(option.route)"
        >
          <component :is="option.icon" :class="styles.cardIcon" aria-hidden="true" />
          <span :class="styles.cardName">{{ $t(option.name) }}</span>
          <van-icon :class="styles.cardArrow" name="arrow" />
        </button>
      </div>

      <button type="button" :class="styles.loginLink" @click="goLogin">
        {{ $t("已有账号？去登录") }}
      </button>

      <icp-record fixed />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Component, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import IcpRecord from "@/components/icp-record/index.vue";
import LanguageSwitcher from "@/components/language-switcher/index.vue";
import IcOutlineHandshake from "~icons/ic/outline-handshake";
import IcOutlineSchool from "~icons/ic/outline-school";
import IcOutlineSupervisorAccount from "~icons/ic/outline-supervisor-account";

import styles from "./index.module.scss";

const route = useRoute();
const router = useRouter();

const leavingMode = ref<"forward" | "backward" | null>(null);
const leavingRoute = ref<string | null>(null);

const identityOptions: { name: string; route: string; icon: Component }[] = [
  { name: "学生", route: "register-student", icon: IcOutlineSchool },
  { name: "教职工", route: "register-teacher", icon: IcOutlineSupervisorAccount },
  { name: "校友", route: "register-alumni", icon: IcOutlineHandshake }
];

const navigateAfterLeave = (name: string, delay: number) => {
  window.setTimeout(() => void router.replace({ name, query: route.query }), delay);
};

const goRegister = (name: string) => {
  if (leavingMode.value) return;
  leavingMode.value = "forward";
  leavingRoute.value = name;
  navigateAfterLeave(name, 700);
};

const goLogin = () => {
  if (leavingMode.value) return;
  leavingMode.value = "backward";
  navigateAfterLeave("login", 850);
};
</script>
