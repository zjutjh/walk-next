import type { AdminAPI } from "api/types/admin";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

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

const readStoredAuth = (): AdminAuthState | undefined => {
  const storedAuth = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (!storedAuth) return undefined;

  try {
    const parsedAuth = JSON.parse(storedAuth) as Partial<AdminAuthState>;
    if (typeof parsedAuth.adminName !== "string" || typeof parsedAuth.pointCode !== "string") {
      return undefined;
    }

    return {
      adminName: parsedAuth.adminName,
      pointCode: parsedAuth.pointCode
    };
  } catch {
    return undefined;
  }
};

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const storedAuth = readStoredAuth();
  const adminName = ref(storedAuth?.adminName ?? EMPTY_AUTH_STATE.adminName);
  const point = ref(storedAuth?.pointCode ?? EMPTY_AUTH_STATE.pointCode);

  const isLoggedIn = computed(() => adminName.value !== "-" && point.value !== "");
  const pointText = computed(() => (POINT_CONFIG[point.value]?.text ?? point.value) || "-");

  const saveLogin = (payload: AdminAPI.AuthResponse) => {
    adminName.value = payload.name;
    point.value = payload.point_name;
    localStorage.setItem(
      ADMIN_AUTH_STORAGE_KEY,
      JSON.stringify({ adminName: adminName.value, point: point.value })
    );
  };

  const clearAuth = () => {
    adminName.value = EMPTY_AUTH_STATE.adminName;
    point.value = EMPTY_AUTH_STATE.pointCode;
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
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
