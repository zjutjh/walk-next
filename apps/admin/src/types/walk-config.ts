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
 * @see {WALK_CAMPUS_ID} */
export type WalkCampusId = (typeof WALK_CAMPUS_ID)[number];

/** 路线ID
 * @see {WALK_ROUTE_ID_MAP} */
export type WalkRouteId = ValueOf<typeof WALK_ROUTE_ID_MAP>[number];

/** 点位ID
 * @see {WALK_PATH_POINT_ID_MAP} */
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

/** 路段配置
 * @see {WalkSegmentInfoMap} 路段的不可配置信息，会根据点位配置自动生成 */
export interface WalkSegmentConfig {
  /** 路段的点击热区 */
  hotSpot?: Component; // TODO: 完成热区后将此字段改为必需
}

/** 将 路径点ID列表 转为 路段key列表
 * @see {SEGMENT_KEY_DELIMITER} */
type SegmentKeyArrayBuilder<PathPointIdArray extends WalkPointId[]> = PathPointIdArray extends [
  // 递归遍历每一个数组元素 Elem:当前遍历的点位ID
  infer PointId extends WalkPointId,
  // Rest:剩余待遍历点位ID组成的数组
  ...infer Rest extends WalkPointId[]
]
  ? // 检查是否有下个点位ID
    Rest[0] extends WalkPointId
    ? [
        // 拼接 当前点位ID 分隔符 下个点位ID 得到路段key
        `${PointId}${typeof SEGMENT_KEY_DELIMITER}${Rest[0]}`,
        // 继续处理后续数组
        ...SegmentKeyArrayBuilder<Rest>
      ]
    : []
  : [];

/** 路线ID-路段key列表 映射表
 * @see {WALK_PATH_POINT_ID_MAP} */
export type WalkSegmentKeyMap = {
  [RouteId in WalkRouteId]: SegmentKeyArrayBuilder<(typeof WALK_PATH_POINT_ID_MAP)[RouteId]>;
};

/** 路段信息
 * @description 这是前端独有的抽象实体，API只消费始末点 */
export interface WalkSegment {
  /** 路段的始点 */
  from: WalkPointId;
  /** 路段的末点 */
  to: WalkPointId;
  /** 路段的文本
   * @see {SEGMENT_TEXT_DELIMITER}
   * @example `${始点点位名}${分隔符}${终点点位名}`
   */
  text: string;
}

/** 路段key
 * @see {SEGMENT_KEY_DELIMITER}
 * @example `${始点ID}${分隔符}${终点ID}` */
export type WalkSegmentKey = ValueOf<WalkSegmentKeyMap>[number];

/** 路段key-路段信息 映射表 常量
 * @see {WALK_POINT_CONFIG} @see {SEGMENT_TEXT_DELIMITER}
 */
export type WalkSegmentInfoMap = UnionToIntersection<
  ValueOf<{
    // 遍历所有 路段ID
    [RouteId in WalkRouteId]: {
      // 遍历 路段ID 对应的 路段key列表，提取出 路段key
      [SegmentId in WalkSegmentKeyMap[RouteId][number]]: SegmentId extends  // 根据 SegmentId 提取出 始点ID From 和 末点ID To
      `${infer From extends WalkPointId}${typeof SEGMENT_KEY_DELIMITER}${infer To extends WalkPointId}`
        ? {
            from: From;
            to: To;
            // 将 始点名 分隔符 终点名 拼接得到路段的文本
            text: `${(typeof WALK_POINT_CONFIG)[From]["name"]}${typeof SEGMENT_TEXT_DELIMITER}${(typeof WALK_POINT_CONFIG)[To]["name"]}`;
          } extends infer Segment extends // 类型收窄
            WalkSegment
          ? Segment
          : never
        : never;
    };
  }>
>;
