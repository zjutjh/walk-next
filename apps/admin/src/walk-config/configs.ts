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

// 辅助性的枚举 不导出消费，仅用于配置填写

/** 校区 */
const enum CampusEnum {
  // cspell:disable
  PingFeng = "pf",
  MoGanShan = "mgs"
  // cspell:enable
}

/** 路线 */
const enum RouteEnum {
  // cspell:disable
  PingFengQuanCheng = "pf-full",
  PingFengBanCheng = "pf-half",
  MoGanShan = "mgs"
  // cspell:enable
}

/** 点位 */
const enum PointEnum {
  // cspell:disable
  PingFengXiaoQu = "pfxq",
  JinLianSi = "jls",
  BaiLongTan = "blt",
  CiMuQiao = "cmq",
  GuZhangShuGongYuan = "gzsgy",
  PingFengShan = "pfs",
  PingFengShanYuan = "pfsy",
  LaoJiaoShan = "ljs",
  MoGanShanXiaoQu = "mgsxq",
  ZhaoFengGongYuan = "zfgy",
  HuaBanGongYuan = "hbgy",
  TianAnYunGu = "tayg",
  DongTiaoXi = "dtx"
  // cspell:enable
}

// API中使用的实体的唯一标识符 包括校区ID、路线ID、点位ID 必须与服务端保持一致

/** 校区ID列表 */
export const CAMPUS_LIST = [
  // cspell:disable
  CampusEnum.PingFeng,
  CampusEnum.MoGanShan
  // cspell:enable
] as const;

/** 校区ID-路线ID列表 映射表 */
export const STRICT_CAMPUS_ROUTE_LIST_MAP = {
  // cspell:disable
  [CampusEnum.PingFeng]: [RouteEnum.PingFengQuanCheng, RouteEnum.PingFengBanCheng],
  [CampusEnum.MoGanShan]: [RouteEnum.MoGanShan]
  // cspell:enable
} as const satisfies Record<CampusId, string[]>;

/** 路线ID-路径点ID列表 映射表 */
export const STRICT_ROUTE_POINT_LIST_MAP = {
  // cspell:disable 注意：点位必须从起点到终点按顺序排列，可以重复出现
  [RouteEnum.PingFengQuanCheng]: [
    PointEnum.PingFengXiaoQu,
    PointEnum.JinLianSi,
    PointEnum.BaiLongTan,
    PointEnum.CiMuQiao,
    PointEnum.GuZhangShuGongYuan,
    PointEnum.PingFengShan,
    PointEnum.PingFengShanYuan,
    PointEnum.PingFengXiaoQu
  ],
  [RouteEnum.PingFengBanCheng]: [
    PointEnum.PingFengXiaoQu,
    PointEnum.JinLianSi,
    PointEnum.LaoJiaoShan,
    PointEnum.PingFengShan,
    PointEnum.PingFengShanYuan,
    PointEnum.PingFengXiaoQu
  ],
  [RouteEnum.MoGanShan]: [
    PointEnum.MoGanShanXiaoQu,
    PointEnum.ZhaoFengGongYuan,
    PointEnum.HuaBanGongYuan,
    PointEnum.TianAnYunGu,
    PointEnum.DongTiaoXi,
    PointEnum.MoGanShanXiaoQu
  ]
  // cspell:enable
} as const satisfies Record<RouteId, string[]>;

// API中使用的实体的信息 包括校区配置、路线配置、点位配置

/** 校区配置 */
export const STRICT_CAMPUS_CONFIG = {
  // cspell:disable
  [CampusEnum.PingFeng]: {
    text: "屏峰",
    mapUrl: WALK_SRC.MAP_PF,
    pointLegendUrl: WALK_SRC.POINT_LEGEND_PF
  },
  [CampusEnum.MoGanShan]: {
    text: "莫干山",
    mapUrl: WALK_SRC.MAP_MSG,
    pointLegendUrl: WALK_SRC.POINT_LEGEND_MGS
  }
  // cspell:enable
} as const satisfies Record<CampusId, CampusConfig>;

/** 路线配置 */
export const STRICT_ROUTE_CONFIG = {
  // cspell:disable
  [RouteEnum.PingFengQuanCheng]: {
    text: "屏峰全程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_PF_FULL,
    dataCardColor: "#fa2d2d"
  },
  [RouteEnum.PingFengBanCheng]: {
    text: "屏峰半程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_PF_HALF,
    dataCardColor: "#3a87fa"
  },
  [RouteEnum.MoGanShan]: {
    text: "莫干山全程",
    legendUrl: WALK_SRC.ROUTE_LEGEND_MGS,
    dataCardColor: "#ff9c00"
  }
  // cspell:enable
} as const satisfies Record<RouteId, RouteConfig>;

/** 点位配置 */
export const STRICT_POINT_CONFIG = {
  // cspell:disable
  [PointEnum.PingFengXiaoQu]: {
    text: "浙江工业大学",
    hotRectList: [
      {
        left: "22%",
        top: "11.5%",
        height: "7%",
        width: "23%"
      }
    ]
  },
  [PointEnum.JinLianSi]: {
    text: "金莲寺",
    hotRectList: [
      {
        left: "22%",
        top: "55%",
        height: "3.5%",
        width: "14%"
      },
      {
        left: "36%",
        top: "56.2%",
        height: "4%",
        width: "4%"
      }
    ]
  },
  [PointEnum.BaiLongTan]: {
    text: "白龙潭",
    hotRectList: [
      {
        left: "18.5%",
        top: "77%",
        height: "4.5%",
        width: "4.5%"
      },
      {
        left: "19.5%",
        top: "81%",
        height: "3.5%",
        width: "14%"
      }
    ]
  },
  [PointEnum.CiMuQiao]: {
    text: "慈母桥",
    hotRectList: [
      {
        left: "49.5%",
        top: "86.5%",
        height: "4.5%",
        width: "4.5%"
      },
      {
        left: "55%",
        top: "89%",
        height: "3.5%",
        width: "14%"
      }
    ]
  },
  [PointEnum.GuZhangShuGongYuan]: {
    text: "古樟树公园",
    hotRectList: [
      {
        left: "69%",
        top: "65.8%",
        height: "4%",
        width: "4.5%"
      },
      {
        left: "73.5%",
        top: "67.5%",
        height: "4%",
        width: "20%"
      }
    ]
  },
  [PointEnum.LaoJiaoShan]: {
    text: "老焦山",
    hotRectList: [{ left: "48%", top: "58%", height: "6.5%", width: "17%" }]
  },
  [PointEnum.PingFengShan]: {
    text: "屏峰山",
    hotRectList: [
      {
        left: "64%",
        top: "48%",
        height: "4%",
        width: "4.5%"
      },
      {
        left: "68.5%",
        top: "49%",
        height: "4%",
        width: "15%"
      }
    ]
  },
  [PointEnum.PingFengShanYuan]: {
    text: "屏峰善院",
    hotRectList: [{ left: "71%", top: "20%", height: "5%", width: "23%" }]
  },
  [PointEnum.MoGanShanXiaoQu]: {
    text: "德馨府广场",
    hotRectList: [
      {
        left: "35.5%",
        top: "34%",
        height: "4.5%",
        width: "9.5%"
      },
      {
        left: "38.3%",
        top: "39.3%",
        height: "6%",
        width: "4%"
      }
    ]
  },
  [PointEnum.ZhaoFengGongYuan]: {
    text: "兆丰公园",
    hotRectList: [
      {
        left: "9.4%",
        top: "65%",
        height: "4.8%",
        width: "10%"
      },
      {
        left: "18.9%",
        top: "69%",
        height: "5.2%",
        width: "3.2%"
      }
    ]
  },
  [PointEnum.HuaBanGongYuan]: {
    text: "滑板公园",
    hotRectList: [{ left: "32.5%", top: "75%", height: "4.6%", width: "13%" }]
  },
  [PointEnum.TianAnYunGu]: {
    text: "天安云谷",
    hotRectList: [
      {
        left: "60%",
        top: "59%",
        height: "5.2%",
        width: "3.2%"
      },
      {
        left: "63%",
        top: "61%",
        height: "5.2%",
        width: "10%"
      }
    ]
  },
  [PointEnum.DongTiaoXi]: {
    text: "东苕溪",
    hotRectList: [
      {
        left: "72.5%",
        top: "16.5%",
        height: "5.2%",
        width: "3.2%"
      },
      {
        left: "76%",
        top: "15.4%",
        height: "5%",
        width: "9.2%"
      }
    ]
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
  [`${PointEnum.PingFengXiaoQu}-${PointEnum.JinLianSi}`]: {
    hotRectList: [
      {
        left: "28%",
        top: "19%",
        width: "14%",
        height: "37%"
      }
    ]
  },
  [`${PointEnum.JinLianSi}-${PointEnum.BaiLongTan}`]: {
    hotRectList: [
      {
        left: "9%",
        top: "70%",
        width: "11%",
        height: "7.7%"
      },
      {
        left: "11%",
        top: "69%",
        width: "26%",
        height: "4%",
        transform: "rotateZ(-28deg)"
      }
    ]
  },
  [`${PointEnum.BaiLongTan}-${PointEnum.CiMuQiao}`]: {
    hotRectList: [
      {
        left: "26%",
        top: "72%",
        height: "6%",
        width: "30%",
        transform: "rotateZ(35deg)"
      }
    ]
  },
  [`${PointEnum.CiMuQiao}-${PointEnum.GuZhangShuGongYuan}`]: {
    hotRectList: [
      {
        left: "54%",
        top: "88%",
        height: "24%",
        width: "5%",
        transform: "rotateZ(229deg)"
      }
    ]
  },
  [`${PointEnum.GuZhangShuGongYuan}-${PointEnum.PingFengShan}`]: {
    hotRectList: [
      {
        left: "66%",
        top: "52.5%",
        height: "14%",
        width: "3%",
        transform: "rotateZ(344deg)"
      }
    ]
  },
  [`${PointEnum.PingFengShan}-${PointEnum.PingFengShanYuan}`]: {
    hotRectList: [
      {
        left: "68%",
        top: "25.5%",
        height: "23%",
        width: "13%"
      }
    ]
  },
  [`${PointEnum.PingFengShanYuan}-${PointEnum.PingFengXiaoQu}`]: {
    hotRectList: [
      {
        left: "60.3%",
        top: "8.7%",
        height: "17%",
        width: "6%",
        transform: "rotateZ(327deg)"
      },
      {
        left: "65%",
        top: "5.5%",
        height: "27%",
        width: "5.5%",
        transform: "rotateZ(57deg)"
      }
    ]
  },
  [`${PointEnum.JinLianSi}-${PointEnum.LaoJiaoShan}`]: {
    hotRectList: [
      {
        left: "39%",
        top: "60%",
        height: "5%",
        width: "9%"
      }
    ]
  },
  [`${PointEnum.LaoJiaoShan}-${PointEnum.PingFengShan}`]: {
    hotRectList: [
      {
        left: "50.5%",
        top: "47%",
        width: "13%",
        height: "10.5%"
      }
    ]
  },
  [`${PointEnum.MoGanShanXiaoQu}-${PointEnum.ZhaoFengGongYuan}`]: {
    hotRectList: [
      {
        left: "26%",
        top: "37.8%",
        width: "14%",
        height: "6.5%",
        transform: "rotateZ(16deg)"
      },
      {
        left: "24%",
        top: "37%",
        width: "5%",
        height: "32.5%",
        transform: "rotateZ(16deg)"
      }
    ]
  },
  [`${PointEnum.ZhaoFengGongYuan}-${PointEnum.HuaBanGongYuan}`]: {
    hotRectList: [
      {
        left: "6%",
        top: "69.8%",
        width: "13%",
        height: "18.5%"
      },
      {
        left: "19%",
        top: "72%",
        width: "16%",
        height: "5%",
        transform: "rotateZ(16deg)"
      }
    ]
  },
  [`${PointEnum.HuaBanGongYuan}-${PointEnum.TianAnYunGu}`]: {
    hotRectList: [
      {
        left: "40%",
        top: "49%",
        width: "4%",
        height: "27.5%",
        transform: "rotateZ(24deg)"
      },
      {
        left: "40%",
        top: "48.5%",
        width: "22%",
        height: "6%",
        transform: "rotateZ(18.6deg)"
      }
    ]
  },
  [`${PointEnum.TianAnYunGu}-${PointEnum.DongTiaoXi}`]: {
    hotRectList: [
      {
        left: "63%",
        top: "36%",
        width: "10%",
        height: "24.5%",
        transform: "rotateZ(8deg)"
      },
      {
        left: "72%",
        top: "22.2%",
        width: "5%",
        height: "20%",
        transform: "rotateZ(0deg)"
      }
    ]
  },
  [`${PointEnum.DongTiaoXi}-${PointEnum.MoGanShanXiaoQu}`]: {
    hotRectList: [
      {
        left: "46.2%",
        top: "17%",
        width: "5%",
        height: "30%",
        transform: "rotateZ(14deg)"
      },
      {
        left: "49.5%",
        top: "17%",
        width: "23%",
        height: "9%",
        transform: "rotateZ(-4deg)"
      }
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
