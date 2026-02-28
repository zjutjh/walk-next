/**
 *
 *
 * API中使用的实体的信息 包括校区配置、路线配置、点位配置
 *
 *
 */

import { Component } from "vue";

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
 * 配置
 */

/** 校区配置
 * @property {string} name 校区名
 * @property {string} mapUrl 地图URL
 */
export const WALK_CAMPUS_CONFIG = {
  pf: {
    name: "屏峰",
    mapUrl: pfMapUrl,
    pointLegendUrl: pfPointLegendUrl
  },
  mgs: {
    name: "莫干山",
    mapUrl: mgsMapUrl,
    pointLegendUrl: mgsPointLegendUrl
  }
} as const satisfies Record<WalkCampusId, WalkCampusConfig>;

/** 路线配置
 * @property {string} name 路线名
 */
export const WALK_ROUTE_CONFIG = {
  "pf-full": {
    name: "屏峰全程",
    legendUrl: pfFullRouteLegendUrl,
    dataCardColor: "#fa2d2d"
  },
  "pf-half": {
    name: "屏峰半程",
    legendUrl: pfHalfRouteLegendUrl,
    dataCardColor: "#3a87fa"
  },
  mgs: {
    name: "莫干山全程",
    legendUrl: mgsRouteLegendUrl,
    dataCardColor: "#ff9c00"
  }
} as const satisfies Record<WalkRouteId, WalkRouteConfig>;

/** 点位配置
 * @property {string} name 点位名
 * @property {Component} hotSpot 点击热区
 */
export const WALK_POINT_CONFIG = {
  // cspell:disable
  pfxq: {
    name: "屏峰校区"
  },
  jls: {
    name: "金莲寺"
  },
  blt: {
    name: "白龙潭"
  },
  cmq: {
    name: "慈母桥"
  },
  gzsgy: {
    name: "古樟树公园"
  },
  ljs: {
    name: "老焦山"
  },
  pfs: {
    name: "屏峰山"
  },
  pfsy: {
    name: "屏峰善院"
  },
  mgsxq: {
    name: "莫干山校区"
  },
  zfgy: {
    name: "兆丰公园"
  },
  hbgy: {
    name: "滑板公园"
  },
  tayg: {
    name: "天安云谷"
  },
  dtx: {
    name: "东苕溪"
  }
  // cspell:enable
} as const satisfies Record<WalkPointId, WalkPointConfig>;

/**
 *
 *
 * 类型
 */

/** 校区配置 */
export interface WalkCampusConfig {
  /** 校区的中文全名（不含“校区”二字） */
  name: string;
  /** 校区的地图的URL */
  mapUrl: string;
  /** 地图上点位的图例URL */
  pointLegendUrl: string;
}

/** 路线配置 */
export interface WalkRouteConfig {
  /** 路线的中文全名 */
  name: string;
  /** 地图上路线的图例URL */
  legendUrl: string;
  /** 数据仪表盘页数据总览的颜色（CSS值） */
  dataCardColor: string;
}

/** 点位配置 */
export interface WalkPointConfig {
  /** 点位的中文全名 */
  name: string;
  /** 点位的地图点击热区 */
  hotSpot?: Component; // TODO: 完成热区后将此字段改为必需
}
