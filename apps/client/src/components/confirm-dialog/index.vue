<template>
  <van-dialog
    v-model:show="isVisible"
    :show-confirm-button="false"
    class="confirm-dialog"
    teleport="body"
  >
    <template v-if="dialogOptions">
      <div class="confirm-dialog__content">
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
        <div class="confirm-dialog__footer">
          <van-button class="confirm-dialog__action" size="small" @click="handleConfirm">
            {{ dialogOptions.actionText ?? t("确认") }}
          </van-button>
          <van-button
            class="confirm-dialog__dismiss"
            type="primary"
            size="small"
            @click="handleCancel"
          >
            {{ dialogOptions.dismissText ?? t("再想想") }}
          </van-button>
        </div>
      </div>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import "./index.scss";

import { useI18n } from "vue-i18n";

import { useConfirmDialog } from "@/composables";

const { t } = useI18n();
const { isVisible, dialogOptions, handleConfirm, handleCancel } = useConfirmDialog();
</script>
