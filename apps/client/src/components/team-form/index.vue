<template>
  <loading-container :loading="props.submitted && isQuotaFetching" :text="t('refresh.loading')">
    <van-form ref="formRef" :disabled="props.loading" @submit="handleSubmit">
      <p :class="styles.publicNotice">
        {{ t("团队名称与口号将公开展示，请文明填写") }}
      </p>

      <van-cell-group inset>
        <van-field
          v-model="formValue.name"
          :rules="createRequiredRuleWithMessage(t('请输入团队名称'))"
          :label="t('团队名称')"
          name="name"
          maxlength="20"
          :placeholder="t('请输入名称')"
          autocomplete="off"
        />

        <van-field
          v-model="formValue.slogan"
          :rules="createRequiredRuleWithMessage(t('请输入团队口号'))"
          :label="t('团队口号')"
          name="slogan"
          maxlength="20"
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

        <!-- 创建时是设定密码，只有编辑已有队伍才需要提示改密码的后果 -->
        <p v-if="props.initialValue" :class="styles.fieldNotice">
          {{ t("修改密码后，已生成的邀请链接和二维码会失效，已加入的队员不受影响") }}
        </p>

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
        <van-button block round plain type="primary" native-type="submit" :loading="props.loading">
          {{ t(props.submitLabel) }}
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
  </loading-container>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { watchImmediate } from "@vueuse/core";
import { createRequiredRuleWithMessage, LoadingContainer } from "shared";
import type { ActionSheetAction, FormInstance } from "vant";
import { computed, reactive, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";

import { isRouteName, ROUTE_OPTIONS } from "@/components/team/utils";
import { CLIENT_QUERY_KEY } from "@/constants";
import { walkClientService } from "@/utils";

import styles from "./index.module.scss";
import type { MatchValue, OpenedSelect, TeamFormRawValue, TeamFormValue } from "./types";

const props = defineProps<{
  loading: boolean;
  initialValue?: TeamFormRawValue;
  submitted?: boolean;
  submitLabel: string;
}>();

const emit = defineEmits<{
  submit: [value: TeamFormValue];
}>();

const { t } = useI18n();

/** 路线名额查询：不自动发起，打开路线选择时（编辑模式且已提交）手动 refetch */
const {
  data: quotaData,
  isFetching: isQuotaFetching,
  refetch: refetchQuota
} = useQuery({
  queryKey: [CLIENT_QUERY_KEY.TEAM.QUOTA] as const,
  queryFn: () => walkClientService.QueryTeamQuota(),
  enabled: false
});

// #region 选项与表单状态
const MATCH_OPTIONS = [
  { label: "不随机", value: "false", subname: "" },
  { label: "随机匹配", value: "true", subname: "随机队友无需密码即可加入" }
] as const;

const formRef = useTemplateRef<FormInstance>("formRef");

const openedSelect = ref<OpenedSelect>("");

const formValue = reactive<TeamFormRawValue>({
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

watchImmediate(
  () => props.initialValue,
  (value) => {
    if (value) {
      Object.assign(formValue, value);
      selectErrors.allowMatch = "";
      selectErrors.routeName = "";
    }
  }
);
// #endregion

// #region 派生状态
const isMatchValue = (value: string): value is MatchValue =>
  MATCH_OPTIONS.some((option) => option.value === value);

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
    subname: option.subname ? t(option.subname) : undefined,
    color: option.value === formValue.allowMatch ? "#734a23" : undefined
  }))
);

const routeActions = computed<ActionSheetAction[]>(() =>
  ROUTE_OPTIONS.map((option) => {
    const quotaItem = quotaData.value?.routes.find(
      (routeData) => routeData.route_name === option.value
    );
    /** 路线是否不可选（当前已选路线即使满额也保持可选） */
    const isRouteDisabled =
      props.submitted &&
      Boolean(quotaItem) &&
      !quotaItem?.available &&
      option.value !== formValue.routeName;
    return {
      name: t(option.label),
      color: option.value === formValue.routeName ? "#734a23" : undefined,
      disabled: isRouteDisabled,
      subname: isRouteDisabled ? t("该路线名额已满") : undefined
    };
  })
);
// #endregion

// #region 交互与提交
const toggleSelect = async (selectName: OpenedSelect) => {
  if (openedSelect.value === selectName) {
    openedSelect.value = "";
    return;
  }

  if (selectName === "route" && props.submitted) {
    await refetchQuota();
  }

  openedSelect.value = selectName;
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
