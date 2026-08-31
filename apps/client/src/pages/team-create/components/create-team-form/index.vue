<template>
  <van-form ref="formRef" :disabled="props.loading" @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-model="formValue.name"
        :rules="nameRules"
        :label="t('团队名称')"
        name="name"
        maxlength="20"
        show-word-limit
        :placeholder="t('请输入名称')"
        autocomplete="off"
      />

      <van-field
        v-model="formValue.slogan"
        :rules="sloganRules"
        :label="t('团队口号')"
        name="slogan"
        maxlength="20"
        show-word-limit
        :placeholder="t('请输入口号')"
        autocomplete="off"
      />

      <van-field
        v-model="formValue.password"
        :rules="passwordRules"
        :label="t('团队密码')"
        name="password"
        :placeholder="t('请输入密码')"
        autocomplete="off"
      />

      <create-select-field
        :label="t('是否随机队友')"
        :placeholder="t('请选择')"
        :options="MATCH_OPTIONS"
        :selected-value="formValue.allowMatch"
        :value-label="selectedMatchLabel"
        :error="selectErrors.allowMatch"
        :opened="openedSelect === 'match'"
        @toggle="toggleSelect('match')"
        @close="closeSelect"
        @select="handleMatchSelect"
      />

      <create-select-field
        :label="t('路线选择')"
        :placeholder="t('请选择')"
        :options="ROUTE_OPTIONS"
        :selected-value="formValue.routeName"
        :value-label="selectedRouteLabel"
        :error="selectErrors.routeName"
        :opened="openedSelect === 'route'"
        @toggle="toggleSelect('route')"
        @close="closeSelect"
        @select="handleRouteSelect"
      />
    </van-cell-group>

    <div :class="styles.submitArea">
      <van-button block round type="primary" native-type="submit" :loading="props.loading">
        {{ t("创建团队") }}
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import type { FieldRule, FormInstance } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

import type { CreateTeamFormValue, MatchValue, OpenedSelect, RouteName } from "../../types";
import CreateSelectField from "../create-select-field/index.vue";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: CreateTeamFormValue];
}>();

const { t } = useI18n();

const MATCH_OPTIONS = [
  { label: "不随机", value: "false" },
  { label: "随机匹配", value: "true" }
] as const;

const ROUTE_OPTIONS = [
  { label: "屏峰半程", value: "pf-half" },
  { label: "屏峰全程", value: "pf-full" },
  { label: "莫干山全程", value: "mgs" }
] as const;

const formRef = useTemplateRef<FormInstance>("formRef");

const openedSelect = ref<OpenedSelect>("");

const formValue = reactive({
  name: "",
  slogan: "",
  password: "",
  allowMatch: "",
  routeName: ""
});

const selectErrors = reactive({
  allowMatch: "",
  routeName: ""
});

const nameRules = computed<FieldRule[]>(() => [{ required: true, message: t("请输入团队名称") }]);
const sloganRules = computed<FieldRule[]>(() => [{ required: true, message: t("请输入团队口号") }]);
const passwordRules = computed<FieldRule[]>(() => [
  { required: true, message: t("请输入团队密码") }
]);

const selectedMatchLabel = computed(() => {
  const option = MATCH_OPTIONS.find((item) => item.value === formValue.allowMatch);
  return option ? t(option.label) : "";
});

const selectedRouteLabel = computed(() => {
  const option = ROUTE_OPTIONS.find((item) => item.value === formValue.routeName);
  return option ? t(option.label) : "";
});

const isMatchValue = (value: string): value is MatchValue =>
  MATCH_OPTIONS.some((option) => option.value === value);

const isRouteName = (value: string): value is RouteName =>
  ROUTE_OPTIONS.some((option) => option.value === value);

const toggleSelect = (selectName: OpenedSelect) => {
  openedSelect.value = openedSelect.value === selectName ? "" : selectName;
};

const closeSelect = () => {
  openedSelect.value = "";
};

const handleMatchSelect = (value: string) => {
  if (!isMatchValue(value)) return;
  formValue.allowMatch = value;
  selectErrors.allowMatch = "";
  openedSelect.value = "";
};

const handleRouteSelect = (value: string) => {
  if (!isRouteName(value)) return;
  formValue.routeName = value;
  selectErrors.routeName = "";
  openedSelect.value = "";
};

const validateSelects = () => {
  selectErrors.allowMatch = formValue.allowMatch ? "" : t("请选择是否随机队友");
  selectErrors.routeName = formValue.routeName ? "" : t("请选择路线");

  return !selectErrors.allowMatch && !selectErrors.routeName;
};

const handleSubmit = async () => {
  formValue.name = formValue.name.trim();
  formValue.slogan = formValue.slogan.trim();
  formValue.password = formValue.password.trim();

  const isSelectValid = validateSelects();

  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  if (!isSelectValid || !isMatchValue(formValue.allowMatch) || !isRouteName(formValue.routeName)) {
    return;
  }

  emit("submit", {
    name: formValue.name,
    slogan: formValue.slogan,
    password: formValue.password,
    allowMatch: formValue.allowMatch === "true",
    routeName: formValue.routeName
  });
};
</script>
