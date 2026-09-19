<template>
  <section :class="styles.section" :aria-label="label">
    <van-collapse v-model="activeNames" :border="false">
      <van-collapse-item name="code" :border="false">
        <template #title>
          <h2 :class="styles.title">
            <van-icon v-if="icon" :name="icon" />
            {{ title }}
            <span v-if="hint" :class="styles.hint">{{ hint }}</span>
            <button
              v-if="props.help"
              type="button"
              :class="styles.helpButton"
              :aria-label="$t('帮助')"
              @click.stop="emit('help')"
            >
              <van-icon name="question-o" />
            </button>
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

import styles from "./index.module.scss";

const props = withDefaults(
  defineProps<{
    title: string;
    label: string;
    icon?: string;
    expanded?: boolean;
    hint?: string;
    help?: boolean;
  }>(),
  { expanded: true, icon: "", hint: "", help: false }
);

const emit = defineEmits<{
  help: [];
}>();

const activeNames = ref<string[]>(props.expanded ? ["code"] : []);

watch(
  () => props.expanded,
  (expanded) => {
    activeNames.value = expanded ? ["code"] : [];
  }
);
</script>
