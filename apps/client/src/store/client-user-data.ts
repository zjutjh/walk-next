import type { QueryUserInfoResponse } from "api/types/client";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { CLIENT_PINIA_PERSIST_KEY } from "@/constants";

export const useClientUserDataStore = defineStore(
  "clientUserData",
  () => {
    const jwt = ref("");
    const userInfo = ref<QueryUserInfoResponse>();
    const isQueryExist = ref(false);
    const isLoggedIn = computed(() => Boolean(jwt.value));

    return {
      jwt,
      userInfo,
      isQueryExist,
      isLoggedIn
    };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.CLIENT_USER_DATA,
      pick: ["jwt", "userInfo"]
    }
  }
);
