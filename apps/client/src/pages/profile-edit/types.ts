import type { UserHome } from "api/types/client";

export interface ProfileEditFormValue {
  tel: string;
  wechat: string;
  qq: string;
  identity: string;
  home: UserHome;
}
