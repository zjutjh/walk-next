import { useStorage } from "@vueuse/core";
import type { AdminAPI } from "api/types/admin";
import { defineStore } from "pinia";
import { computed } from "vue";

import { POINT_CONFIG } from "@/walk-config";

const ADMIN_AUTH_STORAGE_KEY = "walk-next:admin-auth";

interface AdminAuthState {
  adminName: string;
  /** 点位名字,如jls(金莲寺), qd(起点), 注意不是中文, 要中文的话需要用 POINT_CONFIG 映射 */
  pointCode: string;
}

const EMPTY_AUTH_STATE: AdminAuthState = {
  adminName: "-",
  pointCode: ""
};

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const auth = useStorage<AdminAuthState>(
    ADMIN_AUTH_STORAGE_KEY,
    { ...EMPTY_AUTH_STATE },
    localStorage
  );

  const adminName = computed({
    get: () => auth.value.adminName,
    set: (value: string) => {
      auth.value.adminName = value;
    }
  });

  const point = computed({
    get: () => auth.value.pointCode,
    set: (value: string) => {
      auth.value.pointCode = value;
    }
  });

  const isLoggedIn = computed(() => adminName.value !== "-" && point.value !== "");
  const pointText = computed(() => (POINT_CONFIG[point.value]?.text ?? point.value) || "-");

  const saveLogin = (payload: AdminAPI.AuthResponse) => {
    adminName.value = payload.name;
    point.value = payload.point_name;
  };

  const clearAuth = () => {
    auth.value = { ...EMPTY_AUTH_STATE };
  };

  return {
    adminName,
    /** 点位, 如 "jls" */
    point,
    /** 点位中文名，如"金莲寺" */
    pointText,
    isLoggedIn,
    saveLogin,
    /** 清除登录态 */
    clearAuth
  };
});
