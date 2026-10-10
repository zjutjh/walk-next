<template>
  <section :class="styles.header" aria-labelledby="profile-title">
    <div :class="styles.avatar" aria-hidden="true">
      <van-icon name="user-o" size="28" />
    </div>
    <div :class="styles.content">
      <h1 id="profile-title" :class="styles.name">{{ props.name }}</h1>
      <p :class="styles.tel">{{ props.tel }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import styles from "./index.module.scss";

const props = defineProps<{
  name: string;
  tel: string;
}>();
</script>
