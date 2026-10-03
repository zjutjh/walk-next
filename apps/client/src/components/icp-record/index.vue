<template>
  <a
    :class="['icp-record', props.fixed && 'icp-record--fixed']"
    href="https://beian.miit.gov.cn/"
    target="_blank"
    rel="noopener noreferrer"
  >
    {{ icpRecord }}
  </a>
</template>

<script setup lang="ts">
import "./index.scss";

const icpRecord = import.meta.env.VITE_ICP_RECORD;

const props = withDefaults(
  defineProps<{
    /** 是否固定定位到视口底部 */
    fixed?: boolean;
  }>(),
  {
    fixed: false
  }
);
</script>
