<template>
  <van-form ref="formRef" :disabled="props.loading" @submit="handleSubmit">
    <van-cell-group inset>
      <van-field
        v-model="formValue.name"
        :rules="createRequiredRuleWithMessage(t('请输入团队名称'))"
        :label="t('团队名称')"
        name="name"
        maxlength="64"
        :placeholder="t('请输入名称')"
        autocomplete="off"
      />

      <van-field
        v-model="formValue.slogan"
        :rules="createRequiredRuleWithMessage(t('请输入团队口号'))"
        :label="t('团队口号')"
        name="slogan"
        maxlength="128"
        show-word-limit
        :placeholder="t('请输入口号')"
        autocomplete="off"
      />

      <van-field
        v-model="formValue.password"
        :rules="createRequiredRuleWithMessage(t('请输入团队密码'))"
        :label="t('团队密码')"
        name="password"
        maxlength="64"
        :placeholder="t('请输入密码')"
        autocomplete="off"
      />

      <van-field
        :model-value="selectedMatchLabel"
        :error-message="selectErrors.allowMatch"
        :label="t('是否随机队友')"
        :placeholder="t('请选择')"
        readonly
        clickable
        is-link
        @click="toggleSelect('match')"
      />

      <van-field
        :model-value="selectedRouteLabel"
        :error-message="selectErrors.routeName"
        :label="t('路线选择')"
        :placeholder="t('请选择')"
        readonly
        clickable
        is-link
        @click="toggleSelect('route')"
      />
    </van-cell-group>

    <div :class="styles.submitArea">
      <van-button block round type="primary" native-type="submit" :loading="props.loading">
        {{ t("创建团队") }}
      </van-button>
    </div>
  </van-form>

  <van-action-sheet
    :show="openedSelect === 'match'"
    :actions="matchActions"
    :title="t('是否随机队友')"
    :cancel-text="t('取消')"
    :closeable="false"
    close-on-click-action
    @select="handleMatchSelect"
    @cancel="closeSelect"
    @update:show="handleShowUpdate"
  />

  <van-action-sheet
    :show="openedSelect === 'route'"
    :actions="routeActions"
    :title="t('路线选择')"
    :cancel-text="t('取消')"
    :closeable="false"
    close-on-click-action
    @select="handleRouteSelect"
    @cancel="closeSelect"
    @update:show="handleShowUpdate"
  />
</template>

<script setup lang="ts">
import { createRequiredRuleWithMessage } from "shared";
import type { ActionSheetAction, FormInstance } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

import type { CreateTeamFormValue, MatchValue, OpenedSelect, RouteName } from "../../types";
import styles from "./index.module.scss";

const props = defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [value: CreateTeamFormValue];
}>();

const { t } = useI18n();

// #region 选项与表单状态
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

const selectedMatchLabel = computed(() => {
  const option = MATCH_OPTIONS.find((item) => item.value === formValue.allowMatch);
  return option ? t(option.label) : "";
});

const selectedRouteLabel = computed(() => {
  const option = ROUTE_OPTIONS.find((item) => item.value === formValue.routeName);
  return option ? t(option.label) : "";
});

const matchActions = computed<ActionSheetAction[]>(() =>
  MATCH_OPTIONS.map((option) => ({
    name: t(option.label),
    color: option.value === formValue.allowMatch ? "#1989fa" : undefined
  }))
);

const routeActions = computed<ActionSheetAction[]>(() =>
  ROUTE_OPTIONS.map((option) => ({
    name: t(option.label),
    color: option.value === formValue.routeName ? "#1989fa" : undefined
  }))
);

const isMatchValue = (value: string): value is MatchValue =>
  MATCH_OPTIONS.some((option) => option.value === value);

const isRouteName = (value: string): value is RouteName =>
  ROUTE_OPTIONS.some((option) => option.value === value);
// #endregion

// #region 交互与提交
const toggleSelect = (selectName: OpenedSelect) => {
  openedSelect.value = openedSelect.value === selectName ? "" : selectName;
};

const closeSelect = () => {
  openedSelect.value = "";
};

const handleShowUpdate = (show: boolean) => {
  if (show) return;
  closeSelect();
};

/** 按索引取选项，避免翻译后的 `action.name` 与原始 label 匹配不上 */
const handleMatchSelect = (_action: ActionSheetAction, index: number) => {
  const selectedOption = MATCH_OPTIONS[index];
  if (!selectedOption || !isMatchValue(selectedOption.value)) return;
  formValue.allowMatch = selectedOption.value;
  selectErrors.allowMatch = "";
};

const handleRouteSelect = (_action: ActionSheetAction, index: number) => {
  const selectedOption = ROUTE_OPTIONS[index];
  if (!selectedOption || !isRouteName(selectedOption.value)) return;
  formValue.routeName = selectedOption.value;
  selectErrors.routeName = "";
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

  if (!isSelectValid || !isMatchValue(formValue.allowMatch) || !isRouteName(formValue.routeName))
    return;

  emit("submit", {
    name: formValue.name,
    slogan: formValue.slogan,
    password: formValue.password,
    allowMatch: formValue.allowMatch === "true",
    routeName: formValue.routeName
  });
};
// #endregion
</script>
