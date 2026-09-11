<template>
  <section :class="styles.section" :aria-label="label">
    <van-collapse v-model="activeNames" :border="false">
      <van-collapse-item name="code" :border="false" :is-link="false">
        <template #title>
          <h2 :class="styles.title">
            {{ title }}
            <van-icon :class="styles.arrow" :name="isExpanded ? 'arrow-up' : 'arrow-down'" />
          </h2>
        </template>
        <div :class="styles.card">
          <slot />
        </div>
      </van-collapse-item>
    </van-collapse>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import styles from "./index.module.scss";

const props = withDefaults(
  defineProps<{
    title: string;
    label: string;
    expanded?: boolean;
  }>(),
  { expanded: true }
);

const activeNames = ref<string[]>(props.expanded ? ["code"] : []);

watch(
  () => props.expanded,
  (expanded) => {
    activeNames.value = expanded ? ["code"] : [];
  }
);

const isExpanded = computed(() => activeNames.value.includes("code"));
</script>
