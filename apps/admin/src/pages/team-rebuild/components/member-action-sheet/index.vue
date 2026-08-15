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
import { useQueryClient } from "@tanstack/vue-query";
import { useArrayFind } from "@vueuse/core";
import type { TeamRebuildMember } from "api/types/admin";
import { isNil } from "lodash-es";
import { type ActionSheetAction, showSuccessToast } from "vant";
import { computed } from "vue";

import { ADMIN_QUERY_KEY } from "@/constants";

const props = defineProps<{
  /** 重组的团队的成员列表 */
  memberList: TeamRebuildMember[];
}>();

/** 重组的团队的成员ID列表 */
const memberIdList = defineModel<number[]>("memberIdList", { required: true });
/** 成员操作弹层是否可见 */
const isActionSheetVisible = defineModel<boolean>("visible", {
  required: true
});
/** 成员操作弹层当前操作的成员ID */
const actionMemberId = defineModel<number | undefined>("memberId", { required: true });

const queryClient = useQueryClient();

/** 成员操作弹层当前操作的成员 */
const actionMember = useArrayFind(
  () => props.memberList,
  (member) => member.id === actionMemberId.value
);

/** 成员操作弹层选项列表 */
const actionSheetActions = computed<ActionSheetAction[]>(() => [
  {
    name: "设为队长",
    disabled: actionMemberId.value === memberIdList.value.at(0),
    callback: handleSetCaptain
  },
  { name: "删除", color: "var(--van-danger-color)", callback: handleDeleteMember }
]);

/** 将成员设为队长 */
const handleSetCaptain = () => {
  if (isNil(actionMemberId.value)) return;
  memberIdList.value = [
    actionMemberId.value,
    ...memberIdList.value.filter((memberId) => memberId !== actionMemberId.value)
  ];
  // 刷新数据
  queryClient.refetchQueries({
    queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO],
    type: "active"
  });
  showSuccessToast("设置成功");
  isActionSheetVisible.value = false;
};

/** 删除成员 */
const handleDeleteMember = () => {
  memberIdList.value = memberIdList.value.filter((memberId) => memberId !== actionMemberId.value);
  // 刷新其他成员数据
  queryClient.refetchQueries({
    queryKey: [ADMIN_QUERY_KEY.MEMBER.INFO],
    type: "active",
    predicate: (query) => query.queryKey[1] !== actionMemberId.value
  });
  isActionSheetVisible.value = false;
};
</script>
