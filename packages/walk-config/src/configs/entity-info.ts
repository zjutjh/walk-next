/**
 *
 *
 * API中使用的实体的信息 包括校区配置、路线配置、点位配置
 *
 *
 */

import { Simplify, ValueOf } from "type-fest";

import {
  mgsMapUrl,
  mgsPointLegendUrl,
  mgsRouteLegendUrl,
  pfFullRouteLegendUrl,
  pfHalfRouteLegendUrl,
  pfMapUrl,
  pfPointLegendUrl
} from "../assets";
import { WalkCampusId, WalkPointId, WalkRouteId } from "./entity-id";

/**
 *
 *
 * 配置（修改时按从上到下顺序）
 */

/** 校区配置
 * 详细注释 @see WALK_CAMPUS_CONFIG */
const CAMPUS_CONFIG = {
  pf: {
    text: "屏峰",
    mapUrl: pfMapUrl,
    pointLegendUrl: pfPointLegendUrl
  },
  mgs: {
    text: "莫干山",
    mapUrl: mgsMapUrl,
    pointLegendUrl: mgsPointLegendUrl
  }
} as const satisfies Record<WalkCampusId, WalkCampusConfig>;

/** 路线配置
 * 详细注释 @see WALK_ROUTE_CONFIG */
const ROUTE_CONFIG = {
  "pf-full": {
    text: "屏峰全程",
    legendUrl: pfFullRouteLegendUrl,
    dataCardColor: "#fa2d2d"
  },
  "pf-half": {
    text: "屏峰半程",
    legendUrl: pfHalfRouteLegendUrl,
    dataCardColor: "#3a87fa"
  },
  mgs: {
    text: "莫干山全程",
    legendUrl: mgsRouteLegendUrl,
    dataCardColor: "#ff9c00"
  }
} as const satisfies Record<WalkRouteId, WalkRouteConfig>;

/** 点位配置
 详细注释 @see WALK_POINT_CONFIG */
const POINT_CONFIG = {
  // cspell:disable
  pfxq: {
    text: "屏峰校区"
  },
  jls: {
    text: "金莲寺"
  },
  blt: {
    text: "白龙潭"
  },
  cmq: {
    text: "慈母桥"
  },
  gzsgy: {
    text: "古樟树公园"
  },
  ljs: {
    text: "老焦山"
  },
  pfs: {
    text: "屏峰山"
  },
  pfsy: {
    text: "屏峰善院"
  },
  mgsxq: {
    text: "莫干山校区"
  },
  zfgy: {
    text: "兆丰公园"
  },
  hbgy: {
    text: "滑板公园"
  },
  tayg: {
    text: "天安云谷"
  },
  dtx: {
    text: "东苕溪"
  }
  // cspell:enable
} as const satisfies Record<WalkPointId, WalkPointConfig>;

/**
 *
 *
 * 类型（无需修改，自动推导）
 */

/** 校区配置 */
export interface WalkCampusConfig {
  /** 校区的中文全名（不含“校区”二字） */
  text: string;
  /** 校区的地图的URL */
  mapUrl: string;
  /** 地图上点位的图例URL */
  pointLegendUrl: string;
}

/** 路线配置 */
export interface WalkRouteConfig {
  /** 路线的中文全名（不含“路线”二字） */
  text: string;
  /** 地图上路线的图例URL */
  legendUrl: string;
  /** 数据仪表盘页数据总览的颜色（CSS值） */
  dataCardColor: string;
}

/** 点位配置 */
export interface WalkPointConfig {
  /** 点位的中文全名 */
  text: string;
  /** 点位的地图点击热区HTML */
  hotSpotHTML?: string; // TODO: 完成热区后将此字段改为必需
}

/**
 *
 *
 * 将映射表换种类型导出，允许用一般string类型作为Key访问，并确保类型安全
 * @description 由于这里的值才是实际导出值，因此修改JSDoc注释需要在这里修改
 */

/** 使访问只读Record成员时对字符串Key更宽容
 * @description 不在Record的Key中的字符串对应的值会被推断出可能是undefined
 */
type AllowAnyStringKey<RecordType extends Readonly<Record<string, unknown>>> = Simplify<
  Readonly<
    Record<keyof RecordType, ValueOf<RecordType>> & Record<string, ValueOf<RecordType> | undefined>
  >
>;

/** 校区配置
 * @property {string} text 校区名（不含“校区”二字）
 * @property {string} mapUrl 地图URL
 *
 * 修改 @see CAMPUS_CONFIG */
export const WALK_CAMPUS_CONFIG = CAMPUS_CONFIG as AllowAnyStringKey<typeof CAMPUS_CONFIG>;

/** 路线配置
 * @property {string} text 路线名（不含“路线”二字）
 *
 * 修改 @see ROUTE_CONFIG */
export const WALK_ROUTE_CONFIG = ROUTE_CONFIG as AllowAnyStringKey<typeof ROUTE_CONFIG>;

/** 点位配置
 * @property {string} text 点位名
 * @property {Component} hotSpot 点击热区
 *
 * 修改 @see POINT_CONFIG */
export const WALK_POINT_CONFIG = POINT_CONFIG as AllowAnyStringKey<typeof POINT_CONFIG>;
