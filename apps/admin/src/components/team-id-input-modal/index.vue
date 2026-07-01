<template>
  <van-popup
    v-model:show="isVisible"
    class="team-id-input-modal"
    position="center"
    round
    :close-on-click-overlay="false"
    :closeable="false"
    :close-on-popstate="false"
  >
    <div class="team-id-input-modal__content">
      <h3 class="team-id-input-modal__title">输入团队ID</h3>
      <p v-if="description" class="team-id-input-modal__desc">{{ description }}</p>
      <van-field
        v-model="teamIdText"
        class="team-id-input-modal__field"
        label="团队ID"
        placeholder="请输入团队ID"
        type="number"
        inputmode="numeric"
      />

      <div v-if="errorMessage" class="team-id-input-modal__error">{{ errorMessage }}</div>

      <div class="team-id-input-modal__actions">
        <van-button class="team-id-input-modal__button" plain @click="handleCancel">
          取消
        </van-button>
        <van-button class="team-id-input-modal__button" type="primary" @click="handleSubmit">
          确认
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import "./index.scss";

import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    show: boolean;
    description?: string;
  }>(),
  {
    description: ""
  }
);

const emit = defineEmits<{
  "update:show": [value: boolean];
  submit: [teamId: number];
  cancel: [];
}>();

const isVisible = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value)
});

const teamIdText = ref("");
const errorMessage = ref("");

const parseTeamId = (rawText: string) => {
  const trimmed = rawText.trim();
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

const handleSubmit = () => {
  const value = parseTeamId(teamIdText.value);
  if (!value) {
    errorMessage.value = "请输入有效的团队ID";
    return;
  }
  errorMessage.value = "";
  emit("submit", value);
  isVisible.value = false;
};

const handleCancel = () => {
  emit("cancel");
  isVisible.value = false;
};

watch(
  () => props.show,
  (visible) => {
    if (!visible) return;
    teamIdText.value = "";
    errorMessage.value = "";
  }
);
</script>
