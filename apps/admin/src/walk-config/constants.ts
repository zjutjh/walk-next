/**
 *
 *
 * 本文件中的值受TS约束，
 * 如需修改，请从上到下按顺序进行，
 * 修改上方导致下方出现类型报错是正常的，
 * 按照顺序将下方与上方同步即可.
 * 真不会改的话问AI，AI铁会.
 *
 *
 */

import { uniq } from "lodash-es";

import mgsMap from "@/assets/mgs-map.png";
import pfMap from "@/assets/pf-map.jpg";
import type {
  WalkCampusConfig,
  WalkCampusId,
  WalkPointConfig,
  WalkPointId,
  WalkRouteConfig,
  WalkRouteId,
  WalkSegmentConfig,
  WalkSegmentConstant,
  WalkSegmentConstantMap,
  WalkSegmentKey,
  WalkSegmentKeyMap
} from "@/walk-config";

/**
 *
 *
 * 以下是ID配置，均为API中实际使用的ID，需要和服务端保持一致
 */

/** 校区ID列表
 * @property {string} 校区ID */
export const WALK_CAMPUS_ID = ["pf", "mgs"] as const;

/** 校区ID-路线ID列表 映射表
 * @property {string[]} 路线ID列表 */
export const WALK_ROUTE_ID_MAP = {
  pf: ["pf-full", "pf-half"],
  mgs: ["mgs"]
} as const satisfies Record<WalkCampusId, string[]>;

/** 路线ID-路径点ID列表 映射表
 * @property {string[]} 点位ID列表（从起点到终点 按行走顺序排列，点位可重复出现） */
export const WALK_PATH_POINT_ID_MAP = {
  "pf-full": ["pfxq", "jls", "blt", "cmq", "gzsgy", "pfs", "pfsy", "pfxq"],
  "pf-half": ["pfxq", "jls", "ljs", "pfs", "pfsy", "pfxq"],
  mgs: ["mgsxq", "zfgy", "hbgy", "tayg", "dtx", "mgsxq"]
} as const satisfies Record<WalkRouteId, string[]>;

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
 * 以下是 实体ID-实体配置 映射表，所有配置均用于前端消费
 */

/** 校区配置
 * @property {string} name 校区名
 * @property {string} mapUrl 地图URL
 */
export const WALK_CAMPUS_CONFIG = {
  pf: {
    name: "屏峰",
    mapUrl: pfMap
  },
  mgs: {
    name: "莫干山",
    mapUrl: mgsMap
  }
} as const satisfies Record<WalkCampusId, WalkCampusConfig>;

/** 路线配置
 * @property {string} name 路线名
 */
export const WALK_ROUTE_CONFIG = {
  "pf-full": {
    name: "屏峰全程"
  },
  "pf-half": {
    name: "屏峰半程"
  },
  mgs: {
    name: "莫干山全程"
  }
} as const satisfies Record<WalkRouteId, WalkRouteConfig>;

/** 点位配置
 * @property {string} name 点位名
 * @property {Component} hotSpot 点击热区
 */
export const WALK_POINT_CONFIG = {
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
} as const satisfies Record<WalkPointId, WalkPointConfig>;

/**
 *
 *
 * 以下是行程段相关配置
 * @name 行程段(segment) 是前端独有的抽象实体，API中只消费始末点ID
 * 别名@alias 路段 适合用于文本展示，但与@name 路线(route) 易混淆 不在代码中使用
 */

/** 行程段配置
 * @property {Component} hotSpot 点击热区
 *
 * @see {WALK_SEGMENT_CONSTANTS} 则是行程段的不可配置信息，会根据点位配置自动生成
 */
export const WALK_SEGMENT_CONFIG = {
  "blt-cmq": {},
  "cmq-gzsgy": {},
  "dtx-mgsxq": {},
  "gzsgy-pfs": {},
  "hbgy-tayg": {},
  "jls-blt": {},
  "jls-ljs": {},
  "ljs-pfs": {},
  "mgsxq-zfgy": {},
  "pfxq-jls": {},
  "pfsy-pfxq": {},
  "pfs-pfsy": {},
  "tayg-dtx": {},
  "zfgy-hbgy": {}
} as const satisfies Record<WalkSegmentKey, WalkSegmentConfig>;

/** 行程段key分隔符
 * @example 行程段key = `${始点ID}${分隔符}${终点ID}` 如"pointA-pointB" */
export const SEGMENT_KEY_DELIMITER = "-";

/** 行程段文本分隔符
 * @example 行程段文本 = `${始点点位名}${分隔符}${终点点位名}` 如"图书馆→动物园" */
export const SEGMENT_TEXT_DELIMITER = "→";

/**
 *
 *
 * 以下无需修改，是根据 @see {WALK_PATH_POINT_ID_MAP} @see {WALK_POINT_CONFIG} 自动生成的行程段相关常量
 */

/** 路线ID-行程段key列表 映射表（自动生成）
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 @see {SEGMENT_KEY_DELIMITER} 关于key的格式 */
export const WALK_SEGMENT_KEY_MAP = (() => {
  const result: Partial<Record<WalkRouteId, string[]>> = {};
  // 遍历所有行程段ID
  for (const routeId of WALK_ROUTE_ID) {
    /** 当前行程段ID对应的行程段key列表 */
    const keyArray: Array<string> = [];
    // 从第二个开始遍历点位ID
    for (let i = 1; i < WALK_PATH_POINT_ID_MAP[routeId].length; ++i) {
      /** 上一点位ID */
      const previousPointId = WALK_PATH_POINT_ID_MAP[routeId][i - 1] as WalkPointId;
      /** 当前点位ID */
      const currentPointId = WALK_PATH_POINT_ID_MAP[routeId][i] as WalkPointId;
      keyArray.push(
        // 连接 上一点位ID 分隔符 当前点位ID 得到行程段key
        `${previousPointId}${SEGMENT_KEY_DELIMITER}${currentPointId}`
      );
    }
    // 将 行程段ID 映射到 行程段key列表
    result[routeId] = keyArray;
  }
  return result;
})() as WalkSegmentKeyMap;

/** 行程段key列表 */
export const WALK_SEGMENT_KEY = uniq(Object.values(WALK_SEGMENT_KEY_MAP).flat());

/** 行程段的不可配置常量（自动生成）
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 @see {WALK_POINT_CONFIG} 数据源 @see {SEGMENT_TEXT_DELIMITER} 关于行程段的显示文本的格式 */
export const WALK_SEGMENT_CONSTANTS = (() => {
  const result: Partial<Record<WalkSegmentKey, WalkSegmentConstant>> = {};
  // 遍历所有行程段ID
  for (const routeId of WALK_ROUTE_ID) {
    // 从第二个开始遍历点位ID
    for (let i = 1; i < WALK_PATH_POINT_ID_MAP[routeId].length; ++i) {
      /** 上一点位ID */
      const previousPointId = WALK_PATH_POINT_ID_MAP[routeId][i - 1] as WalkPointId;
      /** 当前点位ID */
      const currentPointId = WALK_PATH_POINT_ID_MAP[routeId][i] as WalkPointId;
      /** 连接 上一点位ID 分隔符 当前点位ID 得到的行程段key */
      const segmentKey =
        `${previousPointId}${SEGMENT_KEY_DELIMITER}${currentPointId}` as WalkSegmentKey;
      // 将 行程段key 映射到 行程段不可配置常量
      result[segmentKey] = {
        from: previousPointId,
        to: currentPointId,
        // 将 上一点位ID 分隔符 当前点位ID 拼接得到行程段的文本
        text: `${WALK_POINT_CONFIG[previousPointId].name}${SEGMENT_TEXT_DELIMITER}${WALK_POINT_CONFIG[currentPointId].name}`
      };
    }
  }
  return result;
})() as WalkSegmentConstantMap;
