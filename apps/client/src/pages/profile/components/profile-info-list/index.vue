<template>
  <van-cell-group inset :class="styles.card" :aria-label="t('profile')">
    <template #title>
      <div :class="styles.sectionTitle">
        <van-icon name="user-o" />
        <span>{{ t("profile") }}</span>
      </div>
    </template>

    <van-cell v-for="item in props.items" :key="item.label" :title="item.label">
      <template #value>
        <span :class="styles.value">{{ item.value }}</span>
      </template>
    </van-cell>
  </van-cell-group>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { ProfileInfoItem } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  items: readonly ProfileInfoItem[];
}>();

const { t } = useI18n();
</script>
