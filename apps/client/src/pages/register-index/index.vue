<template>
  <div>
    <language-switcher />

    <div :class="styles.content">
      <h1 :class="styles.title">{{ $t("请选择您的身份") }}</h1>

      <div :class="styles.cardList">
        <button
          v-for="option in identityOptions"
          :key="option.route"
          type="button"
          :class="styles.card"
          @click="goRegister(option.route)"
        >
          <span :class="styles.cardName">{{ $t(option.name) }}</span>
          <van-icon :class="styles.cardArrow" name="arrow" />
        </button>
      </div>

      <router-link :class="styles.loginLink" :to="{ name: 'login', query: route.query }" replace>
        {{ $t("已有账号？去登录") }}
      </router-link>

      <icp-record fixed />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

import IcpRecord from "@/components/icp-record/index.vue";
import LanguageSwitcher from "@/components/language-switcher/index.vue";

import styles from "./index.module.scss";

const route = useRoute();
const router = useRouter();

const identityOptions: { name: string; route: string }[] = [
  { name: "学生", route: "register-student" },
  { name: "教职工", route: "register-teacher" },
  { name: "校友", route: "register-alumni" }
];

const goRegister = (name: string) => {
  void router.replace({ name, query: route.query });
};
</script>
