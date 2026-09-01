import type { ActionSheetAction } from "vant";

import type { ValidLanguage } from "@/constants";

export interface LanguageActionSheetAction extends ActionSheetAction {
  langCode: ValidLanguage;
}
