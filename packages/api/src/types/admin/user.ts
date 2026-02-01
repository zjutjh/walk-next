/** 用户信息（示例） */
export interface UserInfoExample {
  /** 学号 */
  stuId: string;
  /** 姓名 */
  name: string;
  /** 校区 */
  campus: UserCampusExample;
  /** 性别 */
  gender: UserGenderExample;
  /** 联系方式 */
  contact: UserContactExample;
}

/** 用户联系方式（示例） */
export interface UserContactExample {
  /** 电话 */
  tel: string;
  /** qq号 */
  qq: string;
}

/** 用户校区（示例） */
export type UserCampusExample = "ZH" | "PF" | "MGS";

/** 用户性别（示例） */
export type UserGenderExample = "female" | "male" | "unknown";
