import type { PermissionLevel } from "api/types/admin";
import { isNil } from "lodash-es";
import { defineStore } from "pinia";
import { ref } from "vue";

/** 权限等级的权值（用于创建自增数字，不直接消费） */
const enum PermissionWeight {
  EXTERNAL,
  INTERNAL,
  MANAGER,
  SUPER
}

/** 权限等级-权值 映射表 */
const PERMISSION_WEIGHT_MAP = {
  external: PermissionWeight.EXTERNAL,
  internal: PermissionWeight.INTERNAL,
  manager: PermissionWeight.MANAGER,
  super: PermissionWeight.SUPER
} as const satisfies Record<PermissionLevel, PermissionWeight>;

/** 管理员用户信息 */
export const useAuthStore = defineStore(
  "auth",
  () => {
    /** 是否已登录 */
    const isLoggedIn = ref(false);
    /** 管理员姓名 */
    const adminName = ref("");
    /** 点位ID */
    const pointId = ref("");
    /** 权限等级 */
    const permissionLevel = ref<PermissionLevel>();

    const reset = () => {
      isLoggedIn.value = false;
      adminName.value = "";
      pointId.value = "";
      permissionLevel.value = undefined;
    };

    /** 检查是否达到指定权限等级 */
    const hasPermissionLevel = (targetLevel: PermissionLevel) => {
      if (isNil(permissionLevel.value)) return false;
      return PERMISSION_WEIGHT_MAP[permissionLevel.value] >= PERMISSION_WEIGHT_MAP[targetLevel];
    };

    return {
      isLoggedIn,
      adminName,
      pointId,
      permissionLevel,
      reset,
      hasPermissionLevel
    };
  },
  {
    persist: {
      key: "walk-next:admin-auth"
    }
  }
);
