<template>
  <van-nav-bar left-arrow title="精弘毅行表格展示" @click-left="onClickLeft" />
  <van-tabs v-model:active="active" sticky animated sizeable @change="onTabChange">
    <!-- 总览 Tab -->
    <van-tab title="总览">
      <error-empty :error="allRoutesError" @retry="refetchAllRoutes">
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
      </error-empty>
    </van-tab>

    <!-- 具体路线 Tab -->
    <van-tab v-for="(route, index) in routeConfigs" :key="index" :title="route.name">
      <error-empty :error="routeDetailError" @retry="refetchRouteDetail">
        <!-- 经过点位人数 -->
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

        <!-- 点位间人数 -->
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

        <!-- 状态 -->
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
      </error-empty>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts">
import "./data-table-module.scss";

import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import ErrorEmpty from "@/components/error-empty/index.vue";
import { POINT_CONFIG, ROUTE_CONFIG, ROUTE_LIST, ROUTE_POINT_LIST_MAP } from "@/walk-config";

const router = useRouter();
const onClickLeft = () => router.back();

// ────────────────────────── 类型定义 ──────────────────────────

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

interface ApiPointData {
  name?: string;
  point_name?: string;
  count?: number;
  value?: number;
  passed_count?: number;
}

interface ApiRouteDetail {
  checkpoints?: ApiPointData[];
  points?: ApiPointData[];
  total?: number;
  total_count?: number;
  wrong_route?: number;
  wrong_route_count?: number;
  quit?: number;
  quit_count?: number;
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

// ────────────────────────── 静态配置 ──────────────────────────

const active = ref<number>(0);

const routeConfigs: RouteConfig[] = ROUTE_LIST.map((routeId) => ({
  name: (ROUTE_CONFIG[routeId] as { text: string }).text,
  code: routeId,
  points: (ROUTE_POINT_LIST_MAP[routeId] as string[]).map(
    (pointId) => (POINT_CONFIG[pointId] as { text: string }).text
  )
}));

const currentRouteConfig = computed<RouteConfig | null>(
  () => routeConfigs[active.value - 1] ?? null
);

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

// ────────────────────────── 总览数据 ──────────────────────────

const {
  data: allRoutesList,
  error: allRoutesError,
  refetch: refetchAllRoutes
} = useQuery({
  queryKey: ["allRoutes"],
  queryFn: async (): Promise<RouteData[]> => {
    const response = await fetch("/api/dashboard/stats/route/all");
    if (!response.ok) throw new Error("获取总览数据失败");
    const result = await response.json();

    const routesData = result.data;
    let routes: ApiRouteData[] = [];
    if (routesData && "routes" in routesData && Array.isArray(routesData.routes)) {
      routes = routesData.routes;
    } else if (Array.isArray(routesData)) {
      routes = routesData;
    }

    return routeConfigs.map((config) => {
      const matched = routes.find(
        (r) =>
          r.route_name === config.name || r.route_code === config.code || r.name === config.name
      );
      const started = matched?.started ?? 0;
      const total = matched?.total ?? 0;
      return {
        // eslint-disable-next-line camelcase
        route_name: config.name,
        started,
        // eslint-disable-next-line camelcase
        not_started: total - started,
        total,
        finished: matched?.finished ?? 0,
        // eslint-disable-next-line camelcase
        wrong_route: matched?.wrong_route ?? 0,
        quit: matched?.quit ?? 0
      };
    });
  }
});

// ────────────────────────── 路线详情数据 ──────────────────────────

const {
  data: routeDetail,
  error: routeDetailError,
  refetch: refetchRouteDetail
} = useQuery({
  queryKey: computed(() => ["routeDetail", currentRouteConfig.value?.code]),
  queryFn: async (): Promise<ApiRouteDetail> => {
    const config = currentRouteConfig.value;
    if (!config) return {};
    const response = await fetch(
      `/api/dashboard/stats/route?name=${encodeURIComponent(config.code)}`
    );
    if (!response.ok) throw new Error("获取路线详情失败");
    const result = await response.json();
    return result.data ?? {};
  },
  enabled: computed(() => currentRouteConfig.value !== null)
});

// ────────────────────────── computed 派生数据 ──────────────────────────

const checkpointData = computed<PointData[]>(() => {
  const config = currentRouteConfig.value;
  const data = routeDetail.value;
  if (!config) return [];
  if (!data) return config.points.map((name) => ({ name, value: 0 }));

  if (data.checkpoints || data.points) {
    const points = data.checkpoints ?? data.points ?? [];
    return points.map((p) => ({
      name: p.name ?? p.point_name ?? "",
      value: p.count ?? p.value ?? p.passed_count ?? 0
    }));
  }

  return config.points.map((pointName) => {
    const pointData = (data as Record<string, ApiPointData | undefined>)[pointName];
    return {
      name: pointName,
      value: pointData?.count ?? (data as Record<string, number>)[pointName] ?? 0
    };
  });
});

const segmentData = computed<SegmentData[]>(() => {
  const config = currentRouteConfig.value;
  if (!config) return [];

  const segments: SegmentData[] = [];
  for (let i = 0; i < config.points.length - 1; i++) {
    const fromPoint = config.points[i];
    const toPoint = config.points[i + 1];
    if (!fromPoint || !toPoint) continue;

    const fromCount = checkpointData.value.find((p) => p.name === fromPoint)?.value ?? 0;
    const toCount = checkpointData.value.find((p) => p.name === toPoint)?.value ?? 0;

    segments.push({
      from: fromPoint,
      to: toPoint,
      value: Math.max(0, fromCount - toCount)
    });
  }
  return segments;
});

const routeStats = computed<Partial<RouteStats>>(() => {
  const data = routeDetail.value;
  if (!data) return {};
  return {
    total: data.total ?? data.total_count ?? 0,
    // eslint-disable-next-line camelcase
    wrong_route: data.wrong_route ?? data.wrong_route_count ?? 0,
    quit: data.quit ?? data.quit_count ?? 0
  };
});

// ────────────────────────── Tab 切换 ──────────────────────────

const onTabChange = (_index: number) => {
  // useQuery 的 enabled 和 queryKey 已自动处理数据请求
};
</script>
