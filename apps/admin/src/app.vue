<template>
  <van-config-provider :theme-vars="themeVars" theme-vars-scope="global">
    <router-view />
  </van-config-provider>
</template>

<script setup lang="ts">
const themeVars = {
  primaryColor: "var(--palette-pink)",
  successColor: "var(--palette-success)",
  warningColor: "var(--palette-waiting)",
  dangerColor: "var(--palette-coral)",
  infoColor: "var(--palette-info)",
  textColor: "var(--palette-black)",
  textColor2: "var(--palette-text-secondary)",
  textColor3: "var(--palette-text-tertiary)",
  background: "var(--palette-rose)",
  background2: "var(--palette-white)",
  activeColor: "var(--palette-rose)",
  borderColor: "var(--palette-border)"
} as const;
</script>
