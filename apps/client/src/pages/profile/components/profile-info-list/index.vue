<template>
  <section :class="styles.section" :aria-label="t('profile')">
    <h2 :class="styles.title">{{ t("profile") }}</h2>
    <van-cell-group inset :class="styles.list">
      <van-cell v-for="item in props.items" :key="item.label" :title="item.label">
        <template #value>
          <span :class="styles.value">{{ item.value }}</span>
        </template>
      </van-cell>
    </van-cell-group>
  </section>
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
