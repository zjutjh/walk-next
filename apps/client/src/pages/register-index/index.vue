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
            :class="[styles.card, selectedOption === option.route && styles.cardSelected]"
            @click="selectOption(option.route)"
          >
            <img :src="option.image" :alt="option.label" :class="styles.cardImage" />
            <span :class="styles.cardName">{{ t(option.name) }}</span>
            <div :class="styles.cardOverlay" />
            <span :class="styles.cardLabel">
              <img :src="tomatoJamImage" :class="styles.cardIcon" />
              {{ t(option.label) }}
            </span>
          </div>
        </div>
      </div>

      <button
        :class="[styles.confirmButton, !selectedOption && styles.confirmButtonDisabled]"
        :disabled="!selectedOption"
        @click="confirmSelection"
      >
        {{ t("确认") }}
      </button>

      <router-link :class="styles.loginLink" :to="{ name: 'login', query: route.query }" replace>
        {{ t("已有账号？去登录") }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import hero1 from "@/assets/images/hero-1.jpg";
import hero2 from "@/assets/images/hero-2.jpg";
import hero3 from "@/assets/images/hero-3.jpg";
import proudImage from "@/assets/images/proud.png";
import tomatoJamImage from "@/assets/images/tomato-jam.png";
import Decoration from "@/components/decoration/index.vue";

import styles from "./index.module.scss";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const selectedOption = ref<string | null>(null);

const identityOptions = [
  { name: "学生", label: "我是学生", image: hero1, route: "register-student" },
  { name: "教职工", label: "我是教职工", image: hero2, route: "register-teacher" },
  { name: "校友", label: "我是校友", image: hero3, route: "register-alumnus" }
];

const selectOption = (routeName: string) => {
  selectedOption.value = routeName;
};

const confirmSelection = () => {
  if (selectedOption.value) {
    router.replace({ name: selectedOption.value, query: route.query });
  }
};
</script>
