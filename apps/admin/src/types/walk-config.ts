/**
 *
 *
 * 修改路线等无需改动本文件，
 * 本文件的类型用于约束 src/constants 下同名文件中的常量，
 * 会随着常量更改而自动更新.
 *
 *
 */

import type { UnionToIntersection, ValueOf } from "type-fest";
import type { Component } from "vue";

import {
  SEGMENT_KEY_DELIMITER,
  SEGMENT_TEXT_DELIMITER,
  type WALK_CAMPUS_ID,
  type WALK_PATH_POINT_ID_MAP,
  type WALK_POINT_CONFIG,
  type WALK_ROUTE_ID_MAP
} from "@/constants";

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

/** 校区配置 */
export interface WalkCampusConfig {
  /** 校区的中文全名（不含“校区”二字） */
  name: string;
  /** 校区的地图的URL */
  mapUrl: string;
}

/** 路线配置 */
export interface WalkRouteConfig {
  /** 路线的中文全名 */
  name: string;
}

/** 点位配置 */
export interface WalkPointConfig {
  /** 点位的中文全名 */
  name: string;
  /** 点位的地图点击热区 */
  hotSpot?: Component; // TODO: 完成热区后将此字段改为必需
}

/**
 *
 *
 * @name 行程段/路段(segment) 详见 src/constants 下的同名文件中的说明
 */

/** 行程段配置
 *
 * @see {WalkSegmentConstantMap} 则是行程段的不可配置信息，会根据点位配置自动生成 */
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
export interface WalkSegmentConstant {
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
export type WalkSegmentConstantMap = UnionToIntersection<
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
            WalkSegmentConstant
          ? Segment
          : never
        : never;
    };
  }>
>;
