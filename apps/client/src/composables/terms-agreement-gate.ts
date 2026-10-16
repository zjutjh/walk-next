import { showToast } from "vant";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export const useTermsAgreementGate = () => {
  const { t } = useI18n();
  const isAgreed = ref(false);

  const checkAgreed = (): boolean => {
    if (!isAgreed.value) {
      showToast({ message: t("请阅读并同意《用户协议与隐私政策》") });
      return false;
    }
    return true;
  };

  return { isAgreed, checkAgreed };
};
