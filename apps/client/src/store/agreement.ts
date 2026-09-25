import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { AGREEMENT_DATE, CLIENT_PINIA_PERSIST_KEY } from "@/constants";

export const useAgreementStore = defineStore(
  "agreement",
  () => {
    const seenVersion = ref("");

    const isSeen = computed(() => seenVersion.value === AGREEMENT_DATE);

    const markSeen = () => {
      seenVersion.value = AGREEMENT_DATE;
    };

    return { seenVersion, isSeen, markSeen };
  },
  {
    persist: {
      key: CLIENT_PINIA_PERSIST_KEY.AGREEMENT_SEEN,
      pick: ["seenVersion"]
    }
  }
);
