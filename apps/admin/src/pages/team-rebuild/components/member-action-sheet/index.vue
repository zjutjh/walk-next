<!-- 团队重组页成员操作弹层 -->
<template>
  <van-action-sheet
    v-model:show="isActionSheetVisible"
    :actions="actionSheetActions"
    :description="actionMember?.name"
    cancel-text="取消"
  />
</template>

<script setup lang="ts">
import { useArrayFind } from "@vueuse/core";
import type { TeamRebuildMember } from "api/types/admin";
import { isNil } from "lodash-es";
import { type ActionSheetAction, showSuccessToast } from "vant";
import { computed } from "vue";

/** 重组的团队的成员列表 */
const memberList = defineModel<TeamRebuildMember[]>("memberList", { required: true });
/** 成员操作弹层是否可见 */
const isActionSheetVisible = defineModel<boolean>("visible", {
  required: true
});
/** 成员操作弹层当前操作的成员ID */
const actionMemberId = defineModel<number | undefined>("memberId", { required: true });

/** 成员操作弹层当前操作的成员 */
const actionMember = useArrayFind(
  () => memberList.value,
  (member) => member.id === actionMemberId.value
);

/** 成员操作弹层选项列表 */
const actionSheetActions = computed<ActionSheetAction[]>(() => [
  {
    name: "设为队长",
    disabled: actionMemberId.value === memberList.value.at(0)?.id,
    callback: handleSetCaptain
  },
  { name: "删除", color: "var(--van-danger-color)", callback: handleDeleteMember }
]);

/** 将成员设为队长 */
const handleSetCaptain = () => {
  if (isNil(actionMember.value)) return;
  memberList.value = [
    actionMember.value,
    ...memberList.value.filter((member) => member.id !== actionMemberId.value)
  ];
  showSuccessToast("设置成功");
  isActionSheetVisible.value = false;
};

/** 删除成员 */
const handleDeleteMember = () => {
  memberList.value = memberList.value.filter((member) => member.id !== actionMemberId.value);
  isActionSheetVisible.value = false;
};
</script>
