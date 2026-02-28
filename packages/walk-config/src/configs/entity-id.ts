/**
 *
 *
 * API中使用的实体的唯一标识符 包括校区ID、路线ID、点位ID
 * @description 必须与服务端保持一致
 *
 *
 */

import { uniq } from "lodash-es";
import { Simplify, ValueOf } from "type-fest";

/**
 *
 *
 * 配置（修改时按从上到下顺序）
 */

/** 校区ID列表
 * @property {string} 校区ID */
// cspell:disable
export const WALK_CAMPUS_ID_LIST = ["pf", "mgs"] as const;
// cspell:enable

/** 校区ID-路线ID列表 映射表
 * 详细注释 @see */
const ROUTE_ID_MAP = {
  // cspell:disable
  pf: ["pf-full", "pf-half"],
  mgs: ["mgs"]
  // cspell:enable
} as const satisfies Record<WalkCampusId, string[]>;

/** 路线ID-路径点ID列表 映射表
 * 详细注释 @see WALK_POINT_ID_MAP */
const PATH_POINT_ID_MAP = {
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
 * @see ROUTE_ID_MAP 数据源 */
export const WALK_ROUTE_ID_LIST = Object.values(ROUTE_ID_MAP).flat();

/** 点位ID列表
 *
 * @see PATH_POINT_ID_MAP 数据源 */
export const WALK_POINT_ID_LIST = uniq(Object.values(PATH_POINT_ID_MAP).flat());

/** 校区ID-点位ID列表 映射表
 *
 * 数据源 @see WALK_CAMPUS_ID_LIST
 * 数据源 @see ROUTE_ID_MAP
 * 数据源 @see PATH_POINT_ID_MAP
 *
 * 详细注释 @see WALK_CAMPUS_POINT_ID_MAP */
const CAMPUS_POINT_ID_MAP = (() => {
  const result: Partial<Record<WalkCampusId, WalkPointId[]>> = {};
  // 遍历所有校区ID
  for (const campusId of WALK_CAMPUS_ID_LIST) {
    // 计算点位ID
    result[campusId] = uniq(
      ROUTE_ID_MAP[campusId].flatMap((routeId) => PATH_POINT_ID_MAP[routeId])
    );
  }
  return result;
})() as unknown as WalkCampusIdMap;

/**
 *
 *
 * 类型（无需修改，自动推导）
 */

/** 校区ID
 *
 * 数据源 @see WALK_CAMPUS_ID_LIST */
export type WalkCampusId = (typeof WALK_CAMPUS_ID_LIST)[number];

/** 路线ID
 *
 * 数据源 @see ROUTE_ID_MAP */
export type WalkRouteId = ValueOf<typeof ROUTE_ID_MAP>[number];

/** 点位ID
 *
 * 数据源 @see PATH_POINT_ID_MAP */
export type WalkPointId = ValueOf<typeof PATH_POINT_ID_MAP>[number];

/** 校区ID-点位ID列表 映射表
 *
 * 数据源 @see ROUTE_ID_MAP
 * 数据源 @see PATH_POINT_ID_MAP */
export type WalkCampusIdMap = {
  // 遍历所有 校区ID
  [CampusId in WalkCampusId]: {
    // 遍历 校区ID 对应的 路段ID列表，进而取得 路段ID 对应的 点位ID
    [RouteId in (typeof ROUTE_ID_MAP)[CampusId][number]]: (typeof PATH_POINT_ID_MAP)[RouteId][number];
  }[(typeof ROUTE_ID_MAP)[CampusId][number]];
};

/**
 *
 *
 * 将映射表换种类型导出，允许用一般string类型作为Key访问，并确保类型安全
 * @description 由于这里的值才是实际导出值，因此修改JSDoc注释需要在这里修改
 */

/** 使访问只读Record成员时对字符串Key更宽容
 * @description 不在Record的Key中的字符串对应的值会被推断出可能是undefined
 */
export type AllowAnyStringKey<RecordType extends Readonly<Record<string, unknown>>> = Simplify<
  Readonly<
    Record<keyof RecordType, ValueOf<RecordType>> & Record<string, ValueOf<RecordType> | undefined>
  >
>;

/** 校区ID-路线ID列表 映射表
 * @property {string[]} 路线ID列表
 *
 * 修改 @see ROUTE_ID_MAP */
export const WALK_ROUTE_ID_MAP = ROUTE_ID_MAP as AllowAnyStringKey<typeof ROUTE_ID_MAP>;

/** 路线ID-路径点ID列表 映射表
 * @property {string[]} 点位ID列表（从起点到终点 按行走顺序排列，点位可重复出现）
 *
 * 修改 @see PATH_POINT_ID_MAP */
export const WALK_POINT_ID_MAP = PATH_POINT_ID_MAP as AllowAnyStringKey<typeof PATH_POINT_ID_MAP>;

/** 校区ID-点位ID列表 映射表
 * @description 每个校区的点位列表中没有重复
 *
 * 实现 @see CAMPUS_POINT_ID_MAP */
export const WALK_CAMPUS_POINT_ID_MAP = CAMPUS_POINT_ID_MAP as AllowAnyStringKey<
  typeof CAMPUS_POINT_ID_MAP
>;
