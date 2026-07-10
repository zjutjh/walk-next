import { defineStore } from "pinia";
import { ref } from "vue";

export const useErrorBoundaryStore = defineStore("shared/error-boundary", () => {
  const error = ref<unknown>();

  return { error };
});
