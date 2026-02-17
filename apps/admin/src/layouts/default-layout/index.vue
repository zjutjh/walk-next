<template>
  <van-nav-bar
    v-if="$props.title"
    :title="props.title"
    left-arrow
    :class="styles['nav-bar']"
    @click-left="onClickLeft"
  />
  <main :class="styles['layout-main']">
    <slot />
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

import { useTitleMeta } from "./composables/use-title-meta";
import styles from "./index.module.scss";

interface Props {
  title?: string;
}

const props = defineProps<Props>();
const router = useRouter();

const onClickLeft = () => {
  router.back();
};

useTitleMeta();
</script>
