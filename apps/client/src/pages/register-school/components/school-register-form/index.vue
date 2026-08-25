<template>
  <van-form ref="formRef" :class="styles.form" :disabled="props.loading" @submit="handleSubmit">
    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">姓名</label>
      <van-field
        v-model="formValue.name"
        :class="styles.fieldInput"
        :rules="NAME_RULES"
        name="name"
        placeholder="请输入姓名"
        autocomplete="name"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">{{ props.userType === "student" ? "学号" : "工号" }}</label>
      <van-field
        v-model="formValue.stuId"
        :class="styles.fieldInput"
        :rules="stuIdRules"
        name="stuId"
        :placeholder="props.userType === 'student' ? '请输入学号' : '请输入工号'"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">身份证号</label>
      <van-field
        v-model="formValue.identity"
        :class="styles.fieldInput"
        :rules="IDENTITY_RULES"
        name="identity"
        placeholder="请输入身份证号码"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">电话号码</label>
      <van-field
        v-model="formValue.tel"
        :class="styles.fieldInput"
        :rules="TEL_RULES"
        name="tel"
        type="tel"
        maxlength="11"
        placeholder="请输入电话号码"
        autocomplete="tel"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">密码</label>
      <van-field
        v-model="formValue.password"
        :class="styles.fieldInput"
        :rules="PASSWORD_RULES"
        :type="isPasswordVisible ? 'text' : 'password'"
        name="password"
        placeholder="请输入密码"
        autocomplete="new-password"
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
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">QQ（选填）</label>
      <van-field
        v-model="formValue.qq"
        :class="styles.fieldInput"
        name="qq"
        placeholder="请输入QQ号"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.fieldGroup">
      <label :class="styles.fieldLabel">微信（选填）</label>
      <van-field
        v-model="formValue.wechat"
        :class="styles.fieldInput"
        name="wechat"
        placeholder="请输入微信号"
        autocomplete="off"
        clearable
      />
    </div>

    <div :class="styles.agreementRow">
      <van-checkbox v-model="isAgreed" shape="round">
        <span>您已阅读并同意</span>
        <span :class="styles.termsLink" @click.stop="handleNavigateTerms">《隐私政策》</span>
      </van-checkbox>
    </div>

    <div :class="styles.submitArea">
      <van-button :class="styles.submitButton" native-type="submit" :loading="props.loading">
        注册
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import type { FieldRule, FormInstance } from "vant";
import { showToast } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import type { SchoolRegisterFormValue } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  userType: "student" | "teacher";
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: SchoolRegisterFormValue];
}>();

const router = useRouter();
const formRef = useTemplateRef<FormInstance>("formRef");

const formValue = reactive<SchoolRegisterFormValue>({
  name: "",
  stuId: "",
  identity: "",
  tel: "",
  password: "",
  qq: "",
  wechat: ""
});

const isPasswordVisible = ref(false);
const isAgreed = ref(false);

const NAME_RULES: FieldRule[] = [{ required: true, message: "请输入姓名" }];

const stuIdRules = computed<FieldRule[]>(() => [
  {
    required: true,
    message: props.userType === "student" ? "请输入学号" : "请输入工号"
  }
]);

const IDENTITY_RULES: FieldRule[] = [
  { required: true, message: "请输入身份证号码" },
  {
    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
    message: "请输入正确的身份证号码"
  }
];

const TEL_RULES: FieldRule[] = [
  { required: true, message: "请输入电话号码" },
  { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的电话号码" }
];

const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入密码" }];

const handlePasswordVisibleClick = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const handleNavigateTerms = () => {
  router.push({ name: "terms" });
};

const handleSubmit = async () => {
  formValue.name = formValue.name.trim();
  formValue.stuId = formValue.stuId.trim();
  formValue.identity = formValue.identity.trim();
  formValue.tel = formValue.tel.trim();
  formValue.password = formValue.password.trim();
  formValue.qq = formValue.qq?.trim();
  formValue.wechat = formValue.wechat?.trim();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isAgreed.value) {
    showToast({
      message: "请阅读并同意《隐私政策》",
      position: "bottom"
    });
    return;
  }

  emit("submit", {
    name: formValue.name,
    stuId: formValue.stuId,
    identity: formValue.identity,
    tel: formValue.tel,
    password: formValue.password,
    qq: formValue.qq || undefined,
    wechat: formValue.wechat || undefined
  });
};
</script>
