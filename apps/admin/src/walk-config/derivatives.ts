/**
 *
 *
 * 导出量（无需修改，自动生成）
 *
 *
 */

import { uniq } from "lodash-es";

import {
  CAMPUS_LIST,
  SEGMENT_KEY_DELIMITER,
  SEGMENT_TEXT_DELIMITER,
  STRICT_CAMPUS_ROUTE_LIST_MAP,
  STRICT_POINT_CONFIG,
  STRICT_ROUTE_POINT_LIST_MAP
} from "./configs";
import type {
  AllowAnyStringKey,
  CampusId,
  CampusIdListMap,
  CampusSegmentListMap,
  PointId,
  RouteId,
  RouteSegmentListMap,
  SegmentDerivative,
  SegmentDerivativeMap,
  SegmentKey
} from "./types";

// API中使用的实体的唯一标识符 相关导出量

/** 路线ID列表 */
export const ROUTE_LIST = Object.values(STRICT_CAMPUS_ROUTE_LIST_MAP).flat();

/** 点位ID列表 */
export const POINT_LIST = uniq(Object.values(STRICT_ROUTE_POINT_LIST_MAP).flat());

/** 校区ID-点位ID列表 映射表 */
const STRICT_CAMPUS_POINT_LIST_MAP = (() => {
  const result: Partial<Record<CampusId, PointId[]>> = {};
  // 遍历所有校区ID
  for (const campusId of CAMPUS_LIST) {
    // 计算点位ID
    result[campusId] = uniq(
      STRICT_CAMPUS_ROUTE_LIST_MAP[campusId].flatMap(
        (routeId) => STRICT_ROUTE_POINT_LIST_MAP[routeId]
      )
    );
  }
  return result;
})() as unknown as CampusIdListMap;

// 行程段 相关导出量

/** 路线ID-行程段key列表 映射表 */
const STRICT_ROUTE_SEGMENT_LIST_MAP = (() => {
  const result: Partial<Record<RouteId, string[]>> = {};
  // 遍历所有路线ID
  for (const routeId of ROUTE_LIST) {
    /** 当前路线ID对应的行程段key列表 */
    const keyArray: Array<string> = [];
    // 从第二个开始遍历点位ID
    for (let i = 1; i < STRICT_ROUTE_POINT_LIST_MAP[routeId].length; ++i) {
      /** 上一点位ID */
      const previousPointId = STRICT_ROUTE_POINT_LIST_MAP[routeId][i - 1] as PointId;
      /** 当前点位ID */
      const currentPointId = STRICT_ROUTE_POINT_LIST_MAP[routeId][i] as PointId;
      keyArray.push(
        // 连接 上一点位ID 分隔符 当前点位ID 得到行程段key
        `${previousPointId}${SEGMENT_KEY_DELIMITER}${currentPointId}`
      );
    }
    // 将 行程段ID 映射到 行程段key列表
    result[routeId] = keyArray;
  }
  return result;
})() as RouteSegmentListMap;

/** 校区ID-行程段key列表 映射表 */
const STRICT_CAMPUS_SEGMENT_LIST_MAP = (() => {
  const result: Partial<Record<CampusId, SegmentKey[]>> = {};
  // 遍历所有校区ID
  for (const campusId of CAMPUS_LIST) {
    // 计算点位ID
    result[campusId] = uniq(
      STRICT_CAMPUS_ROUTE_LIST_MAP[campusId].flatMap(
        (routeId) => STRICT_ROUTE_SEGMENT_LIST_MAP[routeId]
      )
    );
  }
  return result;
})() as unknown as CampusSegmentListMap;

/** 行程段key列表 */
export const SEGMENT_LIST = uniq(Object.values(STRICT_ROUTE_SEGMENT_LIST_MAP).flat());

/** 行程段key-行程段导出属性 映射表 */
const STRICT_SEGMENT_DERIVATIVE = (() => {
  const result: Partial<Record<SegmentKey, SegmentDerivative>> = {};
  // 遍历所有行程段ID
  for (const routeId of ROUTE_LIST) {
    // 从第二个开始遍历点位ID
    for (let i = 1; i < STRICT_ROUTE_POINT_LIST_MAP[routeId].length; ++i) {
      /** 上一点位ID */
      const previousPointId = STRICT_ROUTE_POINT_LIST_MAP[routeId][i - 1] as PointId;
      /** 当前点位ID */
      const currentPointId = STRICT_ROUTE_POINT_LIST_MAP[routeId][i] as PointId;
      /** 连接 上一点位ID 分隔符 当前点位ID 得到的行程段key */
      const segmentKey =
        `${previousPointId}${SEGMENT_KEY_DELIMITER}${currentPointId}` as SegmentKey;
      // 将 行程段key 映射到 行程段不可配置常量
      result[segmentKey] = {
        from: previousPointId,
        to: currentPointId,
        // 将 上一点位ID 分隔符 当前点位ID 拼接得到行程段的文本
        text: `${STRICT_POINT_CONFIG[previousPointId].text}${SEGMENT_TEXT_DELIMITER}${STRICT_POINT_CONFIG[currentPointId].text}`
      };
    }
  }
  return result;
})() as SegmentDerivativeMap;

// 将所有映射表转换类型导出(转换后允许用任何string类型作为Key访问映射表，此时Value推导类型包含undefined)

/** 路线ID-行程段key列表 映射表 */
export const ROUTE_SEGMENT_LIST_MAP = STRICT_ROUTE_SEGMENT_LIST_MAP as AllowAnyStringKey<
  typeof STRICT_ROUTE_SEGMENT_LIST_MAP
>;

/** 校区ID-点位ID列表 映射表 */
export const CAMPUS_POINT_LIST_MAP = STRICT_CAMPUS_POINT_LIST_MAP as AllowAnyStringKey<
  typeof STRICT_CAMPUS_POINT_LIST_MAP
>;

/** 校区ID-行程段key列表 映射表 */
export const CAMPUS_SEGMENT_LIST_MAP = STRICT_CAMPUS_SEGMENT_LIST_MAP as AllowAnyStringKey<
  typeof STRICT_CAMPUS_SEGMENT_LIST_MAP
>;

/** 行程段的导出属性 */
export const SEGMENT_DERIVATIVE = STRICT_SEGMENT_DERIVATIVE as AllowAnyStringKey<
  typeof STRICT_SEGMENT_DERIVATIVE
>;
