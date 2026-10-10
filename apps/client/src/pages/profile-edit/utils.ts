import type { QueryUserInfoResponse, UpdateUserInfoRequest } from "api/types/client";

import type { ProfileEditFormValue } from "./types";

export function buildInitialFormValue(userInfo?: QueryUserInfoResponse): ProfileEditFormValue {
  return {
    tel: userInfo?.tel ?? "",
    wechat: userInfo?.wechat ?? "",
    qq: userInfo?.qq ?? "",
    home: userInfo?.home || "mainland",
    identity: ""
  };
}

export function normalizeFormValue(value: ProfileEditFormValue): ProfileEditFormValue {
  return {
    tel: value.tel.trim(),
    wechat: value.wechat.trim(),
    qq: value.qq.trim(),
    home: value.home,
    identity: value.identity.trim()
  };
}

export function toUpdateUserInfoRequest(value: ProfileEditFormValue): UpdateUserInfoRequest {
  return {
    contact: {
      tel: value.tel,
      wechat: value.wechat,
      qq: value.qq
    },
    home: value.home,
    ...(value.identity ? { identity: value.identity } : {})
  };
}
