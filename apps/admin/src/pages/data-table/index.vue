<template>
  <van-nav-bar left-arrow title="精弘毅行表格展示" @click-left="onClickLeft" />
  <van-tabs v-model:active="active" sticky animated sizeable @change="onTabChange">
    <!-- 总览 Tab -->
    <van-tab title="总览">
      <van-cell-group
        v-for="(route, index) in allRoutesList"
        :key="index"
        inset
        :title="route.route_name"
      >
        <van-cell
          v-for="item in statusItems"
          :key="item.key"
          :title="item.label"
          title-class="titleClass"
          value-class="valueClass"
        >
          <template #value>
            <span>{{ route[item.key] || 0 }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-tab>

    <!-- 具体路线 Tab -->
    <van-tab v-for="(route, index) in routeConfigs" :key="index" :title="route.name">
      <!-- 经过点位人数：调用特定路线详细统计接口 -->
      <van-cell-group inset title="经过点位人数">
        <van-cell
          v-for="(point, idx) in checkpointData"
          :key="idx"
          :title="point.name"
          title-class="titleClass"
          value-class="valueClass"
        >
          <template #value>
            <span>{{ point.value }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 点位间人数：前端计算（前一已过 - 后一已过） -->
      <van-cell-group inset title="点位间人数">
        <van-cell
          v-for="(segment, idx) in segmentData"
          :key="idx"
          :title="segment.from + ' - ' + segment.to"
          title-class="titleClass"
          value-class="valueClass"
        >
          <template #value>
            <span>{{ segment.value }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 状态：只显示总报名、走错路线、下撤 -->
      <van-cell-group inset title="状态" style="margin-bottom: var(--van-padding-xl)">
        <van-cell
          v-for="item in routeStatusItems"
          :key="item.key"
          :title="item.label"
          title-class="titleClass"
          value-class="valueClass"
        >
          <template #value>
            <span>{{ routeStats[item.key] || 0 }}</span>
          </template>
        </van-cell>
      </van-cell-group>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const onClickLeft = () => {
  router.back();
};

// 类型定义
interface RouteConfig {
  name: string;
  code: string;
  points: string[];
}

interface RouteStats {
  started: number;
  not_started: number;
  total: number;
  finished: number;
  wrong_route: number;
  quit: number;
}

// API 返回的路线数据类型
interface ApiRouteData {
  route_name?: string;
  route_code?: string;
  name?: string;
  started?: number;
  total?: number;
  finished?: number;
  wrong_route?: number;
  quit?: number;
}

// API 返回的点位数据类型
interface ApiPointData {
  name?: string;
  point_name?: string;
  count?: number;
  value?: number;
  passed_count?: number;
}

// API 返回的路线详情类型
interface ApiRouteDetail {
  checkpoints?: ApiPointData[];
  points?: ApiPointData[];
  total?: number;
  total_count?: number;
  wrong_route?: number;
  wrong_route_count?: number;
  quit?: number;
  quit_count?: number;
  // 删除这行或注释掉：[key: string]: ApiPointData | number | undefined;
}

// API 响应数据类型
interface ApiAllRoutesResponse {
  data?:
    | {
        routes?: ApiRouteData[];
      }
    | ApiRouteData[];
}

interface ApiRouteDetailResponse {
  data?: ApiRouteDetail;
}

interface RouteData extends RouteStats {
  route_name: string;
  route_code?: string;
}

interface PointData {
  name: string;
  value: number;
}

interface SegmentData {
  from: string;
  to: string;
  value: number;
}

interface StatusItem {
  key: keyof RouteStats;
  label: string;
}

const active = ref<number>(0);

// 路线配置
const routeConfigs: RouteConfig[] = [
  {
    name: "屏峰全程",
    code: "pf-full",
    points: ["起点", "金莲寺", "老焦山", "屏峰山", "屏峰善院", "终点"]
  },
  {
    name: "屏峰半程",
    code: "pf-half",
    points: ["起点", "金莲寺", "老焦山", "屏峰山", "终点"]
  },
  {
    name: "莫干山全程",
    code: "mgs-full",
    points: ["起点", "剑池", "芦花荡", "怪石角", "大坑景区", "终点"]
  }
];

const statusItems: StatusItem[] = [
  { key: "started", label: "已出发" },
  { key: "not_started", label: "未出发" },
  { key: "total", label: "总报名" },
  { key: "finished", label: "已结束" },
  { key: "wrong_route", label: "走错路线" },
  { key: "quit", label: "下撤" }
];

const routeStatusItems: StatusItem[] = [
  { key: "total", label: "总报名" },
  { key: "wrong_route", label: "走错路线" },
  { key: "quit", label: "下撤" }
];

const API_BASE = "http://127.0.0.1:4523/m1/3276538-2578404-default";
const API_ALL_ROUTES = `${API_BASE}/api/dashboard/stats/route/all?apifoxApiId=418948512`;
const API_ROUTE_DETAIL = `${API_BASE}/api/dashboard/stats/route?apifoxApiId=418948511`;

// 数据存储 - 添加明确类型
const allRoutesList = ref<RouteData[]>([]);
const checkpointData = ref<PointData[]>([]);
const segmentData = ref<SegmentData[]>([]);
const routeStats = ref<Partial<RouteStats>>({});

// Tab 切换处理
const onTabChange = (index: number) => {
  if (index === 0) {
    fetchAllRoutesData();
  } else {
    const routeConfig = routeConfigs[index - 1];
    if (routeConfig) {
      fetchRouteDetailData(routeConfig);
    }
  }
};

// 获取总览数据
const fetchAllRoutesData = async () => {
  try {
    const response = await fetch(API_ALL_ROUTES, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("获取总览数据失败");
    const result: ApiAllRoutesResponse = await response.json();
    // 处理 routes 可能是 result.data.routes 或 result.data
    const routesData = result.data;
    let routes: ApiRouteData[] = [];
    if (routesData && "routes" in routesData && Array.isArray(routesData.routes)) {
      routes = routesData.routes;
    } else if (Array.isArray(routesData)) {
      routes = routesData;
    }

    allRoutesList.value = routeConfigs.map((config: RouteConfig) => {
      const matched = routes.find(
        (r: ApiRouteData) =>
          r.route_name === config.name || r.route_code === config.code || r.name === config.name
      );

      const started = matched?.started ?? 0;
      const total = matched?.total ?? 0;
      const finished = matched?.finished ?? 0;
      // eslint-disable-next-line camelcase
      const wrong_route = matched?.wrong_route ?? 0;
      const quit = matched?.quit ?? 0;

      // 未出发人数 = 总报名 - 已出发
      // eslint-disable-next-line camelcase
      const not_started = total - started;

      return {
        // eslint-disable-next-line camelcase
        route_name: config.name,
        started,
        // eslint-disable-next-line camelcase
        not_started,
        total,
        finished,
        // eslint-disable-next-line camelcase
        wrong_route,
        quit
      };
    });
  } catch (error) {
    console.error("获取总览数据失败:", error);
    allRoutesList.value = routeConfigs.map((config: RouteConfig) => ({
      // eslint-disable-next-line camelcase
      route_name: config.name,
      started: 0,
      // eslint-disable-next-line camelcase
      not_started: 0,
      total: 0,
      finished: 0,
      // eslint-disable-next-line camelcase
      wrong_route: 0,
      quit: 0
    }));
  }
};

// 获取具体路线详情
const fetchRouteDetailData = async (routeConfig: RouteConfig) => {
  checkpointData.value = [];
  segmentData.value = [];
  routeStats.value = {};

  try {
    const response = await fetch(
      `${API_ROUTE_DETAIL}&name=${encodeURIComponent(routeConfig.code)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) throw new Error("获取路线详情失败");
    const result: ApiRouteDetailResponse = await response.json();
    const data: ApiRouteDetail = result.data || ({} as ApiRouteDetail);

    // 解析点位数据
    if (data.checkpoints || data.points) {
      const points: ApiPointData[] = data.checkpoints || data.points || [];
      checkpointData.value = points.map((p: ApiPointData) => ({
        name: p.name || p.point_name || "",
        value: p.count ?? p.value ?? p.passed_count ?? 0
      }));
    } else {
      checkpointData.value = routeConfig.points.map((pointName: string) => {
        const pointData = (data as Record<string, ApiPointData | undefined>)[pointName];
        return {
          name: pointName,
          value: pointData?.count ?? (data as Record<string, number>)[pointName] ?? 0
        };
      });
    }

    // 状态数据
    routeStats.value = {
      total: data.total ?? data.total_count ?? 0,
      // eslint-disable-next-line camelcase
      wrong_route: data.wrong_route ?? data.wrong_route_count ?? 0,
      quit: data.quit ?? data.quit_count ?? 0
    };

    // 计算点位间人数
    calculateSegments(routeConfig);
  } catch (error) {
    console.error("获取路线详情失败:", error);
    checkpointData.value = routeConfig.points.map((name: string) => ({ name, value: 0 }));
  }
};

// 计算点位间人数
const calculateSegments = (routeConfig: RouteConfig) => {
  const segments: SegmentData[] = [];

  for (let i = 0; i < routeConfig.points.length - 1; i++) {
    const fromPoint = routeConfig.points[i];
    const toPoint = routeConfig.points[i + 1];
    if (!fromPoint || !toPoint) continue;
    const fromData = checkpointData.value.find((p: PointData) => p.name === fromPoint);
    const toData = checkpointData.value.find((p: PointData) => p.name === toPoint);

    const fromCount = fromData?.value || 0;
    const toCount = toData?.value || 0;

    let betweenCount = fromCount - toCount;
    if (betweenCount < 0) betweenCount = 0;

    segments.push({
      from: fromPoint,
      to: toPoint,
      value: betweenCount
    });
  }

  segmentData.value = segments;
};

onMounted(() => {
  fetchAllRoutesData();
});
</script>

<style>
:root:root {
  background-color: #fff2ef;
  --van-nav-bar-icon-color: black;
  --van-nav-bar-arrow-size: 17.5px;
  --van-primary-color: #f58888;
}
</style>
