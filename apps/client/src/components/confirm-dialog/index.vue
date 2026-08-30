<template>
  <van-dialog
    v-model:show="isVisible"
    :show-confirm-button="false"
    class="confirm-dialog"
    teleport="body"
  >
    <svg v-if="dialogOptions" class="confirm-dialog__outline-filter" aria-hidden="true">
      <filter id="outline-filter">
        <feMorphology in="SourceAlpha" result="dilated" operator="dilate" radius="4" />
        <feFlood flood-color="#f0fff1" result="color" />
        <feComposite in="color" in2="dilated" operator="in" result="outline" />
        <feMerge>
          <feMergeNode in="outline" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
    <div v-if="dialogOptions" class="confirm-dialog__content">
      <img
        class="confirm-dialog__image"
        src="@/assets/images/programmer.png"
        alt=""
        aria-hidden="true"
      />
      <p class="confirm-dialog__title">{{ dialogOptions.title }}</p>
      <p v-if="dialogOptions.message" class="confirm-dialog__message">
        {{ dialogOptions.message }}
      </p>
      <div
        :class="['confirm-dialog__footer', { 'confirm-dialog__footer--single': isSingleAction }]"
      >
        <van-button
          class="confirm-dialog__action"
          :type="isSingleAction ? 'primary' : 'default'"
          size="small"
          @click="settle(true)"
        >
          {{ dialogOptions.actionText ?? t("确认") }}
        </van-button>
        <van-button
          v-if="!isSingleAction"
          class="confirm-dialog__dismiss"
          type="primary"
          size="small"
          @click="settle(false)"
        >
          {{ dialogOptions.dismissText ?? t("再想想") }}
        </van-button>
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import "./index.scss";

import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useConfirmDialog } from "@/composables";

const { t } = useI18n();
const { isVisible, dialogOptions, settle } = useConfirmDialog();

/** 纯提示模式：dismissText 为 null 时仅保留确认按钮 */
const isSingleAction = computed(() => dialogOptions.value?.dismissText === null);
</script>
