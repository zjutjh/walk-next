<template>
  <section :class="styles.section" :aria-label="label">
    <van-collapse v-model="activeNames" :border="false">
      <van-collapse-item name="code" :border="false">
        <template #title>
          <h2 :class="styles.title">
            <van-icon v-if="icon" :name="icon" />
            {{ title }}
            <span v-if="hint" :class="styles.hint">{{ hint }}</span>
            <help-button
              v-if="props.help"
              :class="styles.helpButton"
              :title="props.helpTitle"
              :message="props.helpMessage"
            />
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
