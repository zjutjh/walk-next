<template>
  <section :class="styles.section" :aria-label="props.label">
    <van-collapse v-model="activeNames" :border="false">
      <van-collapse-item name="code" :border="false">
        <template #title>
          <h2 :class="styles.title">
            <span :class="styles.label">
              <van-icon v-if="props.icon" :name="props.icon" />
              {{ props.title }}
            </span>
            <span v-if="props.hint" :class="styles.hint">{{ props.hint }}</span>
            <span v-if="props.help" :class="styles.helpButton">
              <help-button :title="props.helpTitle" :message="props.helpMessage" />
            </span>
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
import { ref, watch } from "vue";

import HelpButton from "@/components/help-button/index.vue";

import styles from "./index.module.scss";

const props = withDefaults(
  defineProps<{
    title: string;
    label: string;
    icon?: string;
    expanded?: boolean;
    hint?: string;
    help?: boolean;
    helpTitle?: string;
    helpMessage?: string;
  }>(),
  { expanded: true, icon: "", hint: "", help: false, helpTitle: "", helpMessage: "" }
);

const activeNames = ref<string[]>(props.expanded ? ["code"] : []);

watch(
  () => props.expanded,
  (expanded) => {
    activeNames.value = expanded ? ["code"] : [];
  }
);
</script>
