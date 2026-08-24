<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-model="formValue.teamId"
        :rules="TEAM_ID_RULES"
        label="团队编号"
        name="teamId"
        placeholder="请输入团队编号"
        type="digit"
        inputmode="numeric"
        autocomplete="off"
        clearable
      />

      <van-field
        v-model="formValue.password"
        :rules="PASSWORD_RULES"
        :type="isPasswordVisible ? 'text' : 'password'"
        label="团队密码"
        name="password"
        placeholder="请输入团队密码"
        autocomplete="off"
        clearable
      >
        <template #right-icon>
          <button
            :class="styles.eyeButton"
            type="button"
            aria-label="切换密码显示"
            @click.stop="handlePasswordVisibleClick"
          >
            <van-icon :name="isPasswordVisible ? 'eye-o' : 'closed-eye'" />
          </button>
        </template>
      </van-field>
    </van-cell-group>

    <div :class="styles.submitArea">
      <van-button block round type="primary" native-type="submit" :loading="props.loading">
        立即加入
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import type { FieldRule, FormInstance } from "vant";
import { reactive, ref, useTemplateRef } from "vue";

import type { PasswordJoinFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: PasswordJoinFormValue];
}>();

const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive({
  teamId: "",
  password: ""
});

const isPasswordVisible = ref(false);

const TEAM_ID_RULES: FieldRule[] = [{ required: true, message: "请输入团队编号" }];
const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入团队密码" }];

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleSubmit = async () => {
  formValue.teamId = formValue.teamId.trim();
  formValue.password = formValue.password.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  emit("submit", {
    teamId: Number(formValue.teamId),
    password: formValue.password
  });
};
</script>
