<!-- 登录页 -->
<template>
  <loading-container :class="styles.page" :loading="isNavigationPending">
    <!-- 装饰Logo -->
    <img :class="styles.logo" :src="loginPageLogoUrl" />

    <div :class="styles.topArea">
      <!-- 标题 -->
      <div :class="styles.title">登录</div>
      <div :class="styles.productName">精弘毅行管理系统</div>

      <!-- 登录表单 -->
      <login-form :class="styles.form" />
    </div>

    <!-- 装饰背景 -->
    <img :class="styles.decoration" :src="loginPageDecorationUrl" />
  </loading-container>
</template>

<script setup lang="ts">
import { LoadingContainer, useRouterState } from "shared";

import loginPageDecorationUrl from "@/assets/images/login-page-background.svg";
import loginPageLogoUrl from "@/assets/images/login-page-logo.svg";

import LoginForm from "./components/login-form/index.vue";
import styles from "./index.module.scss";

const { isNavigationPending } = useRouterState();
</script>
