import type { QueryUserInfoResponse, UpdateUserInfoRequest } from "api/types/client";

import type { ProfileEditFormValue } from "./types";

export function buildInitialFormValue(userInfo?: QueryUserInfoResponse): ProfileEditFormValue {
  return {
    tel: userInfo?.tel ?? "",
    wechat: userInfo?.wechat ?? "",
    qq: userInfo?.qq ?? "",
    // 用户信息接口不返回身份证号，无法回显
    identity: ""
  };
}

export function normalizeFormValue(value: ProfileEditFormValue): ProfileEditFormValue {
  return {
    tel: value.tel.trim(),
    wechat: value.wechat.trim(),
    qq: value.qq.trim(),
    identity: value.identity.trim()
  };
}

export function toUpdateUserInfoRequest(value: ProfileEditFormValue): UpdateUserInfoRequest {
  const result: UpdateUserInfoRequest = {
    contact: {
      tel: value.tel,
      wechat: value.wechat,
      qq: value.qq
    }
  };

  if (value.identity) result.identity = value.identity;

  return result;
}
