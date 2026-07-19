<!-- 团队重组页成员操作弹层 -->
<template>
  <van-action-sheet
    v-model:show="isMemberActionSheetVisible"
    :actions="memberActionSheetActions"
    :description="memberActionSheetMember?.name"
    cancel-text="取消"
  />
</template>

<script setup lang="ts">
import type { TeamRebuildMember } from "api/types/admin";
import { find, isNil } from "lodash-es";
import { type ActionSheetAction, showSuccessToast } from "vant";
import { computed } from "vue";

/** 重组的团队的成员列表 */
const memberList = defineModel<TeamRebuildMember[]>("memberList", { required: true });
/** 成员操作弹层是否可见 */
const isMemberActionSheetVisible = defineModel<boolean>("visible", {
  required: true
});
/** 成员操作弹层当前操作的成员ID */
const memberActionSheetMemberId = defineModel<number | undefined>("memberId", { required: true });

/** 成员操作弹层当前操作的成员 */
const memberActionSheetMember = computed(() =>
  find(memberList.value, (member) => member.id === memberActionSheetMemberId.value)
);

/** 成员操作弹层选项列表 */
const memberActionSheetActions = computed<ActionSheetAction[]>(() => [
  {
    name: "设为队长",
    disabled: memberActionSheetMemberId.value === memberList.value.at(0)?.id,
    callback: handleSetCaptain
  },
  { name: "删除", color: "var(--van-danger-color)", callback: handleDeleteMember }
]);

/** 将成员设为队长 */
const handleSetCaptain = () => {
  if (isNil(memberActionSheetMember.value)) return;
  memberList.value = [
    memberActionSheetMember.value,
    ...memberList.value.filter((member) => member.id !== memberActionSheetMemberId.value)
  ];
  showSuccessToast("设置成功");
  isMemberActionSheetVisible.value = false;
};

/** 删除成员 */
const handleDeleteMember = () => {
  memberList.value = memberList.value.filter(
    (member) => member.id !== memberActionSheetMemberId.value
  );
  isMemberActionSheetVisible.value = false;
};
</script>
