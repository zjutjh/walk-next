/**
 *
 *
 * API中使用的实体的唯一标识符 包括校区ID、路线ID、点位ID
 * @description 必须与服务端保持一致
 *
 *
 */

import { uniq } from "lodash-es";
import { ValueOf } from "type-fest";

/**
 *
 *
 * 配置
 */

/** 校区ID列表
 * @property {string} 校区ID */
// cspell:disable
export const WALK_CAMPUS_ID = ["pf", "mgs"] as const;
// cspell:enable

/** 校区ID-路线ID列表 映射表
 * @property {string[]} 路线ID列表 */
export const WALK_ROUTE_ID_MAP = {
  // cspell:disable
  pf: ["pf-full", "pf-half"],
  mgs: ["mgs"]
  // cspell:enable
} as const satisfies Record<WalkCampusId, string[]>;

/** 路线ID-路径点ID列表 映射表
 * @property {string[]} 点位ID列表（从起点到终点 按行走顺序排列，点位可重复出现） */
export const WALK_PATH_POINT_ID_MAP = {
  // cspell:disable
  "pf-full": ["pfxq", "jls", "blt", "cmq", "gzsgy", "pfs", "pfsy", "pfxq"],
  "pf-half": ["pfxq", "jls", "ljs", "pfs", "pfsy", "pfxq"],
  mgs: ["mgsxq", "zfgy", "hbgy", "tayg", "dtx", "mgsxq"]
  // cspell:enable
} as const satisfies Record<WalkRouteId, string[]>;

/**
 *
 *
 * 导出量（不可配置，自动生成）
 */

/** 路线ID列表
 *
 * @see {WALK_ROUTE_ID_MAP} 数据源 */
export const WALK_ROUTE_ID = Object.values(WALK_ROUTE_ID_MAP).flat();

/** 点位ID列表
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 */
export const WALK_POINT_ID = uniq(Object.values(WALK_PATH_POINT_ID_MAP).flat());

/**
 *
 *
 * 类型
 */

/** 使Record访问成员时对字符串键更宽容的
 * @description 不在Record的键中的字符串也被认为存在值，但这些非预期的Key对应的值可能是undefined而非ValueType
 */
export type AllowAnyStringKey<RecordType extends Record<string, unknown>> = Record<
  keyof RecordType,
  ValueOf<RecordType>
> &
  Record<string, ValueOf<RecordType> | undefined>;

/** 校区ID
 *
 * @see {WALK_CAMPUS_ID} 数据源 */
export type WalkCampusId = (typeof WALK_CAMPUS_ID)[number];

/** 路线ID
 *
 * @see {WALK_ROUTE_ID_MAP} 数据源 */
export type WalkRouteId = ValueOf<typeof WALK_ROUTE_ID_MAP>[number];

/** 点位ID
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 */
export type WalkPointId = ValueOf<typeof WALK_PATH_POINT_ID_MAP>[number];
