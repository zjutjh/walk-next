/**
 *
 *
 * 类型（无需修改，自动推导）
 *
 *
 */

import type { Simplify, UnionToIntersection, ValueOf } from "type-fest";
import type { StyleValue } from "vue";

import type {
  CAMPUS_LIST,
  SEGMENT_KEY_DELIMITER,
  SEGMENT_TEXT_DELIMITER,
  STRICT_CAMPUS_ROUTE_LIST_MAP,
  STRICT_POINT_CONFIG,
  STRICT_ROUTE_POINT_LIST_MAP
} from "./configs";
import type { ROUTE_SEGMENT_LIST_MAP } from "./derivatives";

/** 使访问只读Record成员时对字符串Key更宽容 */
export type AllowAnyStringKey<RecordType extends Readonly<Record<string, unknown>>> = Simplify<
  Readonly<
    Record<keyof RecordType, ValueOf<RecordType>> & Record<string, ValueOf<RecordType> | undefined>
  >
>;

// API中使用的实体的唯一标识符 相关类型

/** 校区ID */
export type CampusId = (typeof CAMPUS_LIST)[number];

/** 路线ID */
export type RouteId = ValueOf<typeof STRICT_CAMPUS_ROUTE_LIST_MAP>[number];

/** 点位ID */
export type PointId = ValueOf<typeof STRICT_ROUTE_POINT_LIST_MAP>[number];

/** 校区ID-点位ID列表 映射表 */
export type CampusIdListMap = {
  // 遍历所有 校区ID
  [Camp in CampusId]: {
    // 遍历 校区ID 对应的 路段ID列表，进而取得 路段ID 对应的 点位ID
    [Rt in (typeof STRICT_CAMPUS_ROUTE_LIST_MAP)[Camp][number]]: (typeof STRICT_ROUTE_POINT_LIST_MAP)[Rt][number];
  }[(typeof STRICT_CAMPUS_ROUTE_LIST_MAP)[Camp][number]][];
};

// API中使用的实体的可配置项 相关类型

/** 校区配置 */
export interface CampusConfig {
  /** 校区的中文全名（不含“校区”二字） */
  text: string;
  /** 校区的地图的URL */
  mapUrl: string;
  /** 地图上点位的图例URL */
  pointLegendUrl: string;
}

/** 路线配置 */
export interface RouteConfig {
  /** 路线的中文全名（不含“路线”二字） */
  text: string;
  /** 地图上路线的图例URL */
  legendUrl: string;
  /** 数据仪表盘页数据总览的颜色（CSS色值） */
  dataCardColor: string;
}

/** 点位配置 */
export interface PointConfig {
  /** 点位的中文全名 */
  text: string;
  /** 点位的地图点击热区矩形列表 */
  hotRectList: Array<StyleValue>;
}

// 行程段 相关类型

/** 行程段配置 */
export interface SegmentConfig {
  /** 行程段的点击热区矩形列表 */
  hotRectList: Array<StyleValue>;
}

/** 工具类型 将 点位ID列表 转为 行程段key列表 */
type SegmentKeyArrayBuilder<PointIdArray extends PointId[]> = PointIdArray extends [
  // 递归遍历每一个数组元素 Elem:当前遍历的点位ID
  infer First extends PointId,
  // Rest:剩余待遍历点位ID组成的数组
  ...infer Rest extends PointId[]
]
  ? // 检查是否有下个点位ID
    Rest[0] extends PointId
    ? [
        // 拼接 当前点位ID 分隔符 下个点位ID 得到行程段key
        `${First}${typeof SEGMENT_KEY_DELIMITER}${Rest[0]}`,
        // 继续处理后续数组
        ...SegmentKeyArrayBuilder<Rest>
      ]
    : []
  : [];

/** 行程段key */
export type SegmentKey = SegmentKeyArrayBuilder<
  (typeof STRICT_ROUTE_POINT_LIST_MAP)[RouteId]
>[number];

/** 路线ID-行程段key列表 映射表 */
export type RouteSegmentListMap = {
  [Rt in RouteId]: SegmentKeyArrayBuilder<(typeof STRICT_ROUTE_POINT_LIST_MAP)[Rt]>;
};

/** 校区ID-行程段key列表 映射表 */
export type CampusSegmentListMap = {
  // 遍历所有 校区ID
  [Camp in CampusId]: {
    // 遍历 校区ID 对应的 路段ID列表，进而取得 路段ID 对应的 点位ID
    [Rt in (typeof STRICT_CAMPUS_ROUTE_LIST_MAP)[Camp][number]]: (typeof ROUTE_SEGMENT_LIST_MAP)[Rt][number];
  }[(typeof STRICT_CAMPUS_ROUTE_LIST_MAP)[Camp][number]][];
};

/** 行程段的导出属性 */
export interface SegmentDerivative {
  /** 行程段的始点ID */
  from: PointId;
  /** 行程段的末点ID */
  to: PointId;
  /** 行程段的显示文本
   * @see SEGMENT_TEXT_DELIMITER
   * @example `${始点点位名}${分隔符}${终点点位名}`
   */
  text: string;
}

/** 行程段key-行程段导出属性 映射表 */
export type SegmentDerivativeMap = UnionToIntersection<
  ValueOf<{
    // 遍历所有 路线ID
    [Rt in RouteId]: {
      // 遍历 路线ID 对应的 行程段key列表，提取出 行程段key
      [SegKey in RouteSegmentListMap[Rt][number]]: SegKey extends  // 根据 行程段key 提取出 From:始点ID 和 To:末点ID
      `${infer From extends PointId}${typeof SEGMENT_KEY_DELIMITER}${infer To extends PointId}`
        ? {
            from: From;
            to: To;
            // 将 始点名 分隔符 终点名 拼接得到行程段的文本
            text: `${(typeof STRICT_POINT_CONFIG)[From]["text"]}${typeof SEGMENT_TEXT_DELIMITER}${(typeof STRICT_POINT_CONFIG)[To]["text"]}`;
          } extends infer SegDeriv extends // 确保类型是行程段的导出属性
            SegmentDerivative
          ? SegDeriv
          : // 如果推导出这个 说明属性类型填得有问题
            never
        : // 如果推导出这个 说明行程段key格式类型有问题
          never;
    };
  }>
>;
