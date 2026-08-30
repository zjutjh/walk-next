<template>
  <div>
    <decoration :src="proudImage" right="-75px" bottom="0" width="400px" max-width="75vw" />
    <decoration :src="tomatoJamImage" top="120px" right="0" width="100px" max-width="25vw" mirror />
    <decoration :src="tomatoJamImage" top="250px" left="0" width="150px" max-width="37.5vw" />

    <div :class="styles.content">
      <h1 :class="styles.title">{{ t("请选择您的身份") }}</h1>

      <div :class="styles.cardContainer">
        <div :class="styles.cardList">
          <div
            v-for="option in identityOptions"
            :key="option.route"
            :class="styles.card"
            @click="handleNavigate(option.route)"
          >
            <img :src="option.image" :alt="option.label" :class="styles.cardImage" />
            <div :class="styles.cardOverlay" />
            <span :class="styles.cardLabel">
              <img :src="tomatoJamImage" :class="styles.cardIcon" />
              {{ t(option.label) }}
            </span>
          </div>
        </div>
      </div>

      <div :class="styles.loginLink" @click="handleNavigateLogin">
        {{ t("已有账号？去登录") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import hero1 from "@/assets/images/hero-1.jpg";
import hero2 from "@/assets/images/hero-2.jpg";
import hero3 from "@/assets/images/hero-3.jpg";
import proudImage from "@/assets/images/proud.png";
import tomatoJamImage from "@/assets/images/tomato-jam.png";
import Decoration from "@/components/decoration/index.vue";

import styles from "./index.module.scss";

const router = useRouter();
const { t } = useI18n();

const identityOptions = [
  { label: "我是学生", image: hero1, route: "register-student" },
  { label: "我是教职工", image: hero2, route: "register-teacher" },
  { label: "我是校友", image: hero3, route: "register-alumnus" }
];

const handleNavigate = (routeName: string) => {
  router.push({ name: routeName });
};

const handleNavigateLogin = () => {
  router.replace({ name: "login" });
};
</script>
