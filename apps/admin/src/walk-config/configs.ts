/**
 *
 *
 * 可配置项（修改时按从上到下顺序）
 *
 *
 */

import { WALK_SRC } from "./assets";
import type {
  AllowAnyStringKey,
  CampusConfig,
  CampusId,
  PointConfig,
  PointId,
  RouteConfig,
  RouteId,
  SegmentConfig,
  SegmentKey
} from "./types";

// API中使用的实体的唯一标识符 包括校区ID、路线ID、点位ID 必须与服务端保持一致

/** 校区ID列表 */
export const CAMPUS_LIST = [
  // cspell:disable
  "pf",
  "mgs"
  // cspell:enable
] as const;

/** 校区ID-路线ID列表 映射表 */
export const STRICT_CAMPUS_ROUTE_LIST_MAP = {
  // cspell:disable
  pf: ["pf-full", "pf-half"],
  mgs: ["mgs"]
  // cspell:enable
} as const satisfies Record<CampusId, string[]>;

/** 路线ID-路径点ID列表 映射表 */
export const STRICT_ROUTE_POINT_LIST_MAP = {
  // cspell:disable 注意：点位必须从起点到终点按顺序排列，可以重复出现
  "pf-full": ["pfxq", "jls", "blt", "cmq", "gzsgy", "pfs", "pfsy", "pfxq"],
  "pf-half": ["pfxq", "jls", "ljs", "pfs", "pfsy", "pfxq"],
  mgs: ["mgsxq", "zfgy", "hbgy", "tayg", "dtx", "mgsxq"]
  // cspell:enable
} as const satisfies Record<RouteId, string[]>;

// API中使用的实体的信息 包括校区配置、路线配置、点位配置

/** 校区配置 */
export const STRICT_CAMPUS_CONFIG = {
  pf: {
    text: "屏峰",
    mapUrl: WALK_SRC.MAP_PF,
    pointLegendUrl: WALK_SRC.POINT_LEGEND_PF
  },
  mgs: {
    text: "莫干山",
    mapUrl: WALK_SRC.MAP_MSG,
    pointLegendUrl: WALK_SRC.POINT_LEGEND_MGS
  }
} as const satisfies Record<CampusId, CampusConfig>;

/** 路线配置 */
export const STRICT_ROUTE_CONFIG = {
  "pf-full": {
    text: "屏峰全程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_PF_FULL,
    dataCardColor: "#fa2d2d"
  },
  "pf-half": {
    text: "屏峰半程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_PF_HALF,
    dataCardColor: "#3a87fa"
  },
  mgs: {
    text: "莫干山全程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_MGS,
    dataCardColor: "#ff9c00"
  }
} as const satisfies Record<RouteId, RouteConfig>;

/** 点位配置 */
export const STRICT_POINT_CONFIG = {
  // cspell:disable
  pfxq: {
    text: "屏峰校区",
    hotRectList: ["left: 22%;top: 11.5%;height: 7%;width: 23%;"]
  },
  jls: {
    text: "金莲寺",
    hotRectList: ["left: 20%;top: 54%;height: 7%;width: 21%;"]
  },
  blt: {
    text: "白龙潭",
    hotRectList: ["left: 18%;top: 77%;height: 7%;width: 16%;"]
  },
  cmq: {
    text: "慈母桥",
    hotRectList: ["left: 49%;top: 86%;height: 7%;width: 21%;"]
  },
  gzsgy: {
    text: "古樟树公园",
    hotRectList: ["left: 69%;top: 65%;height: 6%;width: 24%;"]
  },
  ljs: {
    text: "老焦山",
    hotRectList: ["left: 48%;top: 58%;height: 6%;width: 17%;"]
  },
  pfs: {
    text: "屏峰山",
    hotRectList: ["left: 63%;top: 47%;height: 6%;width: 20%;"]
  },
  pfsy: {
    text: "屏峰善院",
    hotRectList: ["left: 71%;top: 20%;height: 5%;width: 23%;"]
  },
  mgsxq: {
    text: "莫干山校区",
    hotRectList: ["left: 35.5%;top: 34%;height: 11.8%;width: 9.5%;"]
  },
  zfgy: {
    text: "兆丰公园",
    hotRectList: ["left: 9.4%;top: 65%;height: 9%;width: 12.5%;"]
  },
  hbgy: {
    text: "滑板公园",
    hotRectList: ["left: 32.5%;top: 75%;height: 5%;width: 13%;"]
  },
  tayg: {
    text: "天安云谷",
    hotRectList: ["left: 60%;top: 59%;height: 7%;width: 13%;"]
  },
  dtx: {
    text: "东苕溪",
    hotRectList: ["left: 72%;top: 15%;height: 7%;width: 13%;"]
  }
  // cspell:enable
} as const satisfies Record<PointId, PointConfig>;

/** 行程段的配置
 * 行程段(segment) 是前端独有实体，API中只能消费行程段的始末点ID，不能消费行程段本身
 * 同义词 路段 更适合用于文本展示，但容易与 路线(route) 混淆，代码注释中建议使用 行程段 而非 路段
 */

/** 行程段key分隔符 行程段key=始点ID+分隔符+末点ID */
export const SEGMENT_KEY_DELIMITER = "-";

/** 行程段文本分隔符 行程段文本=始点名+分隔符+末点名 */
export const SEGMENT_TEXT_DELIMITER = "→";

/** 行程段配置 */
export const STRICT_SEGMENT_CONFIG = {
  // cspell:disable
  "pfxq-jls": {
    hotRectList: ["left: 28%;top: 19%;width: 14%;height: 34.4%;"]
  },
  "jls-blt": {
    hotRectList: [
      "left: 9%;top: 70%;width: 9.8%;height: 7.7%;",
      "left: 11%;top: 69%;width: 22%;height: 4%;transform: rotateZ(-28deg);"
    ]
  },
  "blt-cmq": {
    hotRectList: [
      "left: 24%;top: 75%;height: 3%;width: 11%;transform: rotateZ(6deg);",
      "left: 36.5%;top: 77%;height: 3.5%;width: 18%;transform: rotateZ(48deg);"
    ]
  },
  "cmq-gzsgy": {
    hotRectList: ["left: 55%;top: 87%;height: 20%;width: 5%;transform: rotateZ(229deg);"]
  },
  "gzsgy-pfs": {
    hotRectList: ["left: 66%;top: 53.5%;height: 12%;width: 3%;transform: rotateZ(344deg);"]
  },
  "pfs-pfsy": {
    hotRectList: ["left: 69%;top: 25.5%;height: 21%;width: 12%;"]
  },
  "pfsy-pfxq": {
    hotRectList: [
      "left: 60%;top: 8%;height: 16%;width: 6%;transform: rotateZ(327deg);",
      "left: 65%;top: 5.5%;height: 27%;width: 5.5%;transform: rotateZ(57deg);"
    ]
  },
  "jls-ljs": {
    hotRectList: ["left: 39%;top: 60%;height: 5%;width: 9%;"]
  },
  "ljs-pfs": {
    hotRectList: ["left: 50.5%;top: 47%;width: 12%;height: 10.5%;"]
  },
  "mgsxq-zfgy": {
    hotRectList: [
      "left: 26%;top: 38.8%;width: 11.7%;height: 10.1%;",
      "left: 24%;top: 38%;width: 5%;height: 30%;transform: rotateZ(16deg);"
    ]
  },
  "zfgy-hbgy": {
    hotRectList: [
      "left: 5%;top: 71.5%;width: 12%;height: 16.5%;transform: rotateZ(0deg);",
      "left: 23%;top: 73%;width: 10%;height: 6%;transform: rotateZ(16deg);"
    ]
  },
  "hbgy-tayg": {
    hotRectList: [
      "left: 40%;top: 49%;width: 4%;height: 26%;transform: rotateZ(24deg);",
      "left: 40%;top: 48.5%;width: 21%;height: 6%;transform: rotateZ(18.6deg);"
    ]
  },
  "tayg-dtx": {
    hotRectList: [
      "left: 63%;top: 36%;width: 10%;height: 23%;transform: rotateZ(8deg);",
      "left: 72%;top: 22.2%;width: 5%;height: 20%;transform: rotateZ(0deg);"
    ]
  },
  "dtx-mgsxq": {
    hotRectList: [
      "left: 45%;top: 17%;width: 5%;height: 27%;",
      "left: 49.5%;top: 17%;width: 22%;height: 9%;transform: rotateZ(-4deg);"
    ]
  }
  // cspell:enable
} as const satisfies Record<SegmentKey, SegmentConfig>;

// 将所有映射表转换类型导出(转换后允许用任何string类型作为Key访问映射表，此时Value推导类型包含undefined)

/** 校区ID-路线ID列表 映射表 */
export const CAMPUS_ROUTE_LIST_MAP = STRICT_CAMPUS_ROUTE_LIST_MAP as AllowAnyStringKey<
  typeof STRICT_CAMPUS_ROUTE_LIST_MAP
>;

/** 路线ID-路径点ID列表 映射表 */
export const ROUTE_POINT_LIST_MAP = STRICT_ROUTE_POINT_LIST_MAP as AllowAnyStringKey<
  typeof STRICT_ROUTE_POINT_LIST_MAP
>;

/** 校区配置 */
export const CAMPUS_CONFIG = STRICT_CAMPUS_CONFIG as AllowAnyStringKey<typeof STRICT_CAMPUS_CONFIG>;

/** 路线配置 */
export const ROUTE_CONFIG = STRICT_ROUTE_CONFIG as AllowAnyStringKey<typeof STRICT_ROUTE_CONFIG>;

/** 点位配置 */
export const POINT_CONFIG = STRICT_POINT_CONFIG as AllowAnyStringKey<typeof STRICT_POINT_CONFIG>;

/** 行程段配置 */
export const SEGMENT_CONFIG = STRICT_SEGMENT_CONFIG as AllowAnyStringKey<
  typeof STRICT_SEGMENT_CONFIG
>;
