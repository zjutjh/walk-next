<template>
  <Teleport to="body">
    <div
      ref="layer"
      :class="[styles.layer, !isLayerVisible && styles.isLayerHidden]"
      :style="layerStyle"
      aria-hidden="true"
    >
      <invite-card v-if="teamInfo" :class="styles.ticket" :team="teamInfo">
        <van-button block type="primary">{{ $t("确认加入") }}</van-button>
      </invite-card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { useElementBounding, useElementSize, useWindowSize } from "@vueuse/core";
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";

import InviteCard from "@/components/invite-card/index.vue";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import styles from "./index.module.scss";

const props = defineProps<{
  /** 展开时才定位并取数 */
  opened: boolean;
  teamId: number;
  password: string;
}>();

const { data: teamInfo } = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.INFO, props.teamId] as const,
  enabled: () => props.opened,
  queryFn: () =>
    walkClientService.QueryTeamBasicInfo({
      // eslint-disable-next-line camelcase
      team_id: props.teamId,
      password: props.password
    })
});

// 分享面板由 vant 渲染，只能按组件库类名取到它的节点，据此把预览贴在其上沿之上
const sheet = shallowRef<HTMLElement>();
// 面板底部安全区算在 padding 里，用 useElementBounding 取 border-box 高度才不会少算一截
const { height: sheetHeight } = useElementBounding(sheet);
const sheetZIndex = computed(() =>
  sheet.value ? Number(window.getComputedStyle(sheet.value).zIndex) || 0 : 0
);

watch(
  () => props.opened,
  (opened) => {
    const el = opened ? document.querySelector<HTMLElement>(".van-share-sheet") : null;
    sheet.value = el ?? undefined;
  },
  { immediate: true, flush: "post" }
);

// 浮层自身高度参与排版计算，票据渲染出来之前量不到高度，先不定位。
// 用 ResizeObserver 量布局高度（useElementSize），getBoundingClientRect 会被自身 transform 影响，没法反推缩放比例
const layer = useTemplateRef<HTMLElement>("layer");
const { height: layerHeight } = useElementSize(layer, undefined, { box: "border-box" });
const { height: windowHeight } = useWindowSize();

const MIN_GAP = 12;

/** 剩余空间放得下就按原尺寸在面板以上垂直居中；放不下就整体等比缩小到刚好放下 */
const fit = computed(() => {
  if (!layerHeight.value || !windowHeight.value) return { bottom: 0, scale: 1 };

  const available = windowHeight.value - sheetHeight.value;
  const freeSpace = available - layerHeight.value;
  if (freeSpace >= MIN_GAP * 2) {
    return { bottom: sheetHeight.value + freeSpace / 2, scale: 1 };
  }

  const scale = Math.min(Math.max((available - MIN_GAP * 2) / layerHeight.value, 0.5), 1);
  return { bottom: sheetHeight.value + MIN_GAP, scale };
});

// 面板收起时量到的高度会瞬间归零，冻结最后一次有效的定位，避免淡出过程中浮层往下跳
const anchor = ref({ bottom: 0, zIndex: 0, scale: 1 });

watch(
  [fit, sheet],
  () => {
    if (sheet.value && sheetHeight.value > 0 && layerHeight.value > 0) {
      anchor.value = { ...fit.value, zIndex: sheetZIndex.value + 1 };
    }
  },
  { immediate: true }
);

const isLayerVisible = computed(
  () => props.opened && sheetHeight.value > 0 && teamInfo.value !== undefined
);

const layerStyle = computed(() => ({
  bottom: `${anchor.value.bottom}px`,
  zIndex: `${anchor.value.zIndex}`,
  transform: `scale(${anchor.value.scale})`
}));
</script>
