import { defineStore } from "pinia";
import { ref } from "vue";

/** 全局错误边界组件状态 */
export const useErrorBoundaryStore = defineStore("shared/error-boundary", () => {
  const error = ref<unknown>();

  return { error };
});
