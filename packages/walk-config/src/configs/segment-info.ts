/**
 *
 *
 * 行程段使用的信息
 * @name 行程段(segment) 是前端独有实体，API中只能消费行程段的始末点ID，不能消费行程段本身
 * 同义词@alias 路段 更适合用于文本展示，但容易与@name 路线(route) 混淆，代码注释中建议使用@name 行程段 而非@alias 路段
 *
 *
 */

import { uniq } from "lodash-es";
import { UnionToIntersection, ValueOf } from "type-fest";
import { Component } from "vue";

import { WALK_PATH_POINT_ID_MAP, WALK_ROUTE_ID, WalkPointId, WalkRouteId } from "./entity-id";
import { WALK_POINT_CONFIG } from "./entity-info";

/**
 *
 *
 * 配置
 */

/** 行程段key分隔符
 * @example 行程段key = `${始点ID}${分隔符}${终点ID}` 如"pointA-pointB" */
export const SEGMENT_KEY_DELIMITER = "-";

/** 行程段文本分隔符
 * @example 行程段文本 = `${始点点位名}${分隔符}${终点点位名}` 如"图书馆→动物园" */
export const SEGMENT_TEXT_DELIMITER = "→";

/** 行程段配置
 * @property {Component} hotSpot 点击热区
 *
 * @see {WALK_SEGMENT_DERIVATIVE} 则是行程段的不可配置的导出量，会根据点位配置自动生成
 */
export const WALK_SEGMENT_CONFIG = {
  // cspell:disable
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
  // cspell:enable
} as const satisfies Record<WalkSegmentKey, WalkSegmentConfig>;

/**
 *
 *
 * 导出量（不可配置，自动生成）
 */

/** 路线ID-行程段key列表 映射表
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

/** 行程段的导出量
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 @see {WALK_POINT_CONFIG} 数据源 @see {SEGMENT_TEXT_DELIMITER} 关于行程段的显示文本的格式 */
export const WALK_SEGMENT_DERIVATIVE = (() => {
  const result: Partial<Record<WalkSegmentKey, WalkSegmentDerivative>> = {};
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
})() as WalkSegmentDerivativeMap;

/**
 *
 *
 * 类型
 */

/** 行程段配置
 *
 * @see {WalkSegmentDerivativeMap} 则是行程段的不可配置信息，会根据点位配置自动生成 */
export interface WalkSegmentConfig {
  /** 行程段的点击热区 */
  hotSpot?: Component; // TODO: 完成热区后将此字段改为必需
}

/** 将 路径点ID列表 转为 行程段key列表
 *
 * @see {SEGMENT_KEY_DELIMITER} 关于key的格式 */
type SegmentKeyArrayBuilder<PathPointIdArray extends WalkPointId[]> = PathPointIdArray extends [
  // 递归遍历每一个数组元素 Elem:当前遍历的点位ID
  infer PointId extends WalkPointId,
  // Rest:剩余待遍历点位ID组成的数组
  ...infer Rest extends WalkPointId[]
]
  ? // 检查是否有下个点位ID
    Rest[0] extends WalkPointId
    ? [
        // 拼接 当前点位ID 分隔符 下个点位ID 得到行程段key
        `${PointId}${typeof SEGMENT_KEY_DELIMITER}${Rest[0]}`,
        // 继续处理后续数组
        ...SegmentKeyArrayBuilder<Rest>
      ]
    : []
  : [];

/** 路线ID-行程段key列表 映射表（自动生成）
 *
 * @see {WALK_PATH_POINT_ID_MAP} 数据源 */
export type WalkSegmentKeyMap = {
  [RouteId in WalkRouteId]: SegmentKeyArrayBuilder<(typeof WALK_PATH_POINT_ID_MAP)[RouteId]>;
};

/** 行程段的不可配置信息（自动生成） */
export interface WalkSegmentDerivative {
  /** 行程段的始点ID */
  from: WalkPointId;
  /** 行程段的末点ID */
  to: WalkPointId;
  /** 行程段的显示文本
   * @see {SEGMENT_TEXT_DELIMITER}
   * @example `${始点点位名}${分隔符}${终点点位名}`
   */
  text: string;
}

/** 行程段key
 *
 * @see {SEGMENT_KEY_DELIMITER} 关于key的格式 */
export type WalkSegmentKey = ValueOf<WalkSegmentKeyMap>[number];

/** 行程段key-行程段不可配置常量 映射表 （自动生成）
 *
 * @see {WALK_POINT_CONFIG} 数据源 @see {SEGMENT_TEXT_DELIMITER} 关于key的格式
 */
export type WalkSegmentDerivativeMap = UnionToIntersection<
  ValueOf<{
    // 遍历所有 行程段ID
    [RouteId in WalkRouteId]: {
      // 遍历 行程段ID 对应的 行程段key列表，提取出 行程段key
      [SegmentId in WalkSegmentKeyMap[RouteId][number]]: SegmentId extends  // 根据 SegmentId 提取出 From:始点ID 和 To:末点ID
      `${infer From extends WalkPointId}${typeof SEGMENT_KEY_DELIMITER}${infer To extends WalkPointId}`
        ? {
            from: From;
            to: To;
            // 将 始点名 分隔符 终点名 拼接得到行程段的文本
            text: `${(typeof WALK_POINT_CONFIG)[From]["name"]}${typeof SEGMENT_TEXT_DELIMITER}${(typeof WALK_POINT_CONFIG)[To]["name"]}`;
          } extends infer Segment extends // 类型收窄
            WalkSegmentDerivative
          ? Segment
          : never
        : never;
    };
  }>
>;
