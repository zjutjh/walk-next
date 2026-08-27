<template>
  <van-popup
    :show="props.opened"
    position="bottom"
    round
    closeable
    :class="styles.popup"
    @click-close-icon="handleCloseClick"
    @click-overlay="handleCloseClick"
  >
    <section :class="styles.content">
      <h2 :class="styles.title">修改信息</h2>

      <van-form ref="formRef" :disabled="props.loading" @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="formValue.name"
            :rules="NAME_RULES"
            label="团队名称"
            name="name"
            maxlength="20"
            show-word-limit
            placeholder="请输入名称"
            autocomplete="off"
          />

          <van-field
            v-model="formValue.slogan"
            :rules="SLOGAN_RULES"
            label="团队口号"
            name="slogan"
            maxlength="20"
            show-word-limit
            placeholder="请输入口号"
            autocomplete="off"
          />

          <van-field
            v-model="formValue.password"
            :rules="PASSWORD_RULES"
            label="团队密码"
            name="password"
            placeholder="请输入密码"
            autocomplete="off"
          />

          <van-field
            :model-value="selectedMatchLabel"
            :error-message="selectErrors.allowMatch"
            label="是否随机队友"
            placeholder="请选择"
            readonly
            clickable
            is-link
            @click="handleSelectOpen('match')"
          />

          <van-field
            :model-value="selectedRouteLabel"
            :error-message="selectErrors.routeName"
            label="路线选择"
            placeholder="请选择"
            readonly
            clickable
            is-link
            @click="handleSelectOpen('route')"
          />
        </van-cell-group>

        <div :class="styles.submitArea">
          <van-button block round type="primary" native-type="submit" :loading="props.loading">
            更新信息
          </van-button>
        </div>
      </van-form>
    </section>

    <van-action-sheet
      :show="openedSelect === 'match'"
      :actions="matchActions"
      title="是否随机队友"
      cancel-text="取消"
      close-on-click-action
      @select="handleMatchSelect"
      @cancel="handleSelectClose"
      @update:show="handleSelectShowUpdate"
    />

    <van-action-sheet
      :show="openedSelect === 'route'"
      :actions="routeActions"
      title="路线选择"
      cancel-text="取消"
      close-on-click-action
      @select="handleRouteSelect"
      @cancel="handleSelectClose"
      @update:show="handleSelectShowUpdate"
    />
  </van-popup>
</template>

<script setup lang="ts">
import type { QueryTeamDetailResponse } from "api/types/client";
import type { ActionSheetAction, FieldRule, FormInstance } from "vant";
import { computed, reactive, ref, useTemplateRef, watch } from "vue";

import type { MatchValue, OpenedTeamEditSelect, RouteName, TeamEditFormValue } from "../../types";
import { getRouteLabel, isRouteName } from "../../utils";
import styles from "./index.module.scss";

const props = defineProps<{
  opened: boolean;
  team: QueryTeamDetailResponse | undefined;
  loading: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [value: TeamEditFormValue];
}>();

const MATCH_OPTIONS = [
  { label: "不随机", value: "false" },
  { label: "随机匹配", value: "true" }
] as const;

const ROUTE_OPTIONS = [
  { label: "屏峰半程", value: "pf-half" },
  { label: "屏峰全程", value: "pf-full" },
  { label: "莫干山全程", value: "mgs" }
] as const;

const NAME_RULES: FieldRule[] = [{ required: true, message: "请输入团队名称" }];
const SLOGAN_RULES: FieldRule[] = [{ required: true, message: "请输入团队口号" }];
const PASSWORD_RULES: FieldRule[] = [{ required: true, message: "请输入团队密码" }];

const formRef = useTemplateRef<FormInstance>("formRef");
const openedSelect = ref<OpenedTeamEditSelect>("");

const formValue = reactive({
  name: "",
  slogan: "",
  password: "",
  allowMatch: "" as MatchValue | "",
  routeName: "" as RouteName | ""
});

const selectErrors = reactive({
  allowMatch: "",
  routeName: ""
});

const isMatchValue = (value: string): value is MatchValue =>
  MATCH_OPTIONS.some((option) => option.value === value);

const selectedMatchLabel = computed(
  () => MATCH_OPTIONS.find((option) => option.value === formValue.allowMatch)?.label ?? ""
);

const selectedRouteLabel = computed(() =>
  formValue.routeName ? getRouteLabel(formValue.routeName) : ""
);

const matchActions = computed<ActionSheetAction[]>(() =>
  MATCH_OPTIONS.map((option) => ({
    name: option.label,
    color: option.value === formValue.allowMatch ? "#1989fa" : undefined
  }))
);

const routeActions = computed<ActionSheetAction[]>(() =>
  ROUTE_OPTIONS.map((option) => ({
    name: option.label,
    color: option.value === formValue.routeName ? "#1989fa" : undefined
  }))
);

watch(
  () => props.team,
  (team) => {
    if (!team) return;
    formValue.name = team.name;
    formValue.slogan = team.slogan;
    formValue.password = team.password;
    formValue.allowMatch = team.allow_match ? "true" : "false";
    formValue.routeName = isRouteName(team.route_name) ? team.route_name : "";
    selectErrors.allowMatch = "";
    selectErrors.routeName = "";
  },
  { immediate: true }
);

const handleCloseClick = () => {
  emit("close");
};

const handleSelectOpen = (selectName: OpenedTeamEditSelect) => {
  openedSelect.value = selectName;
};

const handleSelectClose = () => {
  openedSelect.value = "";
};

const handleSelectShowUpdate = (show: boolean) => {
  if (show) return;
  handleSelectClose();
};

const handleMatchSelect = (action: ActionSheetAction) => {
  const selectedOption = MATCH_OPTIONS.find((option) => option.label === action.name);
  if (!selectedOption || !isMatchValue(selectedOption.value)) return;
  formValue.allowMatch = selectedOption.value;
  selectErrors.allowMatch = "";
};

const handleRouteSelect = (action: ActionSheetAction) => {
  const selectedOption = ROUTE_OPTIONS.find((option) => option.label === action.name);
  if (!selectedOption || !isRouteName(selectedOption.value)) return;
  formValue.routeName = selectedOption.value;
  selectErrors.routeName = "";
};

const validateSelects = () => {
  selectErrors.allowMatch = formValue.allowMatch ? "" : "请选择是否随机队友";
  selectErrors.routeName = formValue.routeName ? "" : "请选择路线";

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
