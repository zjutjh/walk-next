import { useMutation } from "@tanstack/vue-query";
import { AdminAPI, QR_CODE, type QrCodeType, TEAM_WALK_STATUS } from "api/types/admin";
import { showConfirmDialog, showFailToast, showSuccessToast } from "vant";
import type { Ref } from "vue";
import type { Router } from "vue-router";

import type { QrCodeData } from "@/composables/use-qr-scanner";
import { walkAdminService } from "@/utils";
import {
  CAMPUS_LIST,
  CAMPUS_POINT_LIST_MAP,
  CAMPUS_ROUTE_LIST_MAP,
  ROUTE_POINT_LIST_MAP
} from "@/walk-config";

interface CheckinHandlersOptions {
  router: Router;
  getAuthPoint: () => string;
  isStartOrEndAdmin: () => boolean;
  pendingTeamId: Ref<number | null>;
  pendingCheckinCode: Ref<string | null>;
  pendingTeamNeedsBind: Ref<boolean>;
  expectedScanType: Ref<QrCodeType | null>;
  isProcessing: Ref<boolean>;
  isTeamIdInputFromCheckin: Ref<boolean>;
  requestScan: (expectedType?: QrCodeType) => void;
  openTeamIdInput: (fromCheckin: boolean) => void;
  clearPendingState: () => void;
}

type FetchTeamStatusResult = AdminAPI.GetTeamStatusResponse | null;

/** 本文件里各种报错, 提示统一管理 */
const MESSAGE = {
  InvalidTeamCode: "团队码内容不合法",
  InvalidCheckinCode: "签到码内容不合法",
  PermissionDenied: "该队伍还未绑定签到码，当前点位无绑定权限",
  FetchTeamStatusFailed: "获取团队状态失败",
  BindFailed: "绑定失败",
  BindSuccess: "绑定成功",
  ScanStartFailed: "扫码启动失败",
  ScanTeamFirst: "请扫描团队码",
  ScanCheckinFirst: "请扫描签到码",
  NotInCampus: "该队伍不属于当前校区，无法操作",
  PromptScanCheckin: "已获取团队ID, 接下来请扫签到码",
  PromptScanTeamOrInput: "已扫到签到码, 接下来请扫团队码或输入团队ID",
  DialogTitle: "提示",
  DialogConfirmScan: "去扫码",
  DialogConfirmTeam: "扫码团队码",
  DialogCancel: "取消",
  DialogInputTeam: "输入团队ID"
} as const;

const parseTeamId = (rawText: string) => {
  const trimmed = rawText.trim();
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

const isTeamBound = (status: AdminAPI.GetTeamStatusResponse) => {
  if (status.team.status !== TEAM_WALK_STATUS.NotStart) return true;
};

const getCampusIdByRoute = (routeName: string | undefined) => {
  if (!routeName) return undefined;
  for (const campusId of CAMPUS_LIST) {
    const routeList = CAMPUS_ROUTE_LIST_MAP[campusId];
    if (routeList.includes(routeName as never)) return campusId;
  }
  return undefined;
};

const getCampusIdByPoint = (pointCode: string) => {
  for (const campusId of CAMPUS_LIST) {
    const list = CAMPUS_POINT_LIST_MAP[campusId];
    if (list.includes(pointCode as never)) return campusId;
  }
  return undefined;
};

/** 起终点集 */
const START_END_POINT_SET = (() => {
  const result = new Set<string>();
  for (const routePoints of Object.values(ROUTE_POINT_LIST_MAP)) {
    if (!Array.isArray(routePoints)) continue;
    const firstPoint = routePoints[0];
    const lastPoint = routePoints[routePoints.length - 1];
    if (typeof firstPoint === "string") result.add(firstPoint);
    if (typeof lastPoint === "string") result.add(lastPoint);
  }
  return result;
})();
export const isStartOrEndPoint = (pointCode: string) => START_END_POINT_SET.has(pointCode);

/** 判断管理员和被扫到的团队是否同一个校区 */
const isCampusMatch = (teamRouteName: string, adminPoint: string) => {
  const teamCampusId = getCampusIdByRoute(teamRouteName);
  const adminCampusId = getCampusIdByPoint(adminPoint);
  if (!adminCampusId) return true;
  if (!teamCampusId) return true;
  return teamCampusId === adminCampusId;
};

/** 扫入or输入 团队码or签到码 后根据管理员自身信息 进行统一处理的处理器 */
export const createCheckinHandlers = (options: CheckinHandlersOptions) => {
  const { router } = options;

  const reportInvalidTeamCode = () => showFailToast(MESSAGE.InvalidTeamCode);
  const reportInvalidCheckinCode = () => showFailToast(MESSAGE.InvalidCheckinCode);
  const reportPermissionDenied = () => showFailToast(MESSAGE.PermissionDenied);

  const { mutateAsync: fetchTeamStatus } = useMutation({
    mutationFn: (teamId: number) => walkAdminService.GetTeamStatus({ team_id: teamId }),
    onError: (err: Error) => {
      showFailToast(err.message || MESSAGE.FetchTeamStatusFailed);
    }
  });
  // TODO: 此处navigate到的路由随便写的 请和team_info页的pr合并后根据实际路由调整
  const navigateToTeamInfo = (teamId: number, routeName?: string) => {
    const campusId = getCampusIdByRoute(routeName) ?? getCampusIdByPoint(options.getAuthPoint());
    if (!campusId) return;
    router.push({ path: `/team-list/${campusId}`, query: { team_id: String(teamId) } });
  };

  const { mutateAsync: bindCheckinCode } = useMutation({
    mutationFn: (payload: { teamId: number; code: string }) =>
      walkAdminService.BindCheckinCode({ team_id: payload.teamId, content: payload.code }),
    onSuccess: () => {
      showSuccessToast(MESSAGE.BindSuccess);
      options.clearPendingState();
    },
    onError: (err: Error) => {
      showFailToast(err.message || MESSAGE.BindFailed);
    }
  });

  /** 弹窗请求获取签到码(只能通过扫码) */
  const promptScanCheckin = async () => {
    try {
      await showConfirmDialog({
        title: MESSAGE.DialogTitle,
        message: MESSAGE.PromptScanCheckin,
        confirmButtonText: MESSAGE.DialogConfirmScan,
        cancelButtonText: MESSAGE.DialogCancel
      });
      options.requestScan(QR_CODE.Checkin);
    } catch {
      options.pendingTeamId.value = null;
      options.pendingTeamNeedsBind.value = false;
    }
  };

  /** 弹窗请求获取团队码(通过扫码或输入) */
  const promptTeamCodeOrInput = async () => {
    try {
      await showConfirmDialog({
        title: MESSAGE.DialogTitle,
        message: MESSAGE.PromptScanTeamOrInput,
        confirmButtonText: MESSAGE.DialogConfirmTeam,
        cancelButtonText: MESSAGE.DialogInputTeam
      });
      options.requestScan(QR_CODE.Team);
    } catch {
      options.openTeamIdInput(true);
    }
  };

  /** 获取到团队码后进行处理 */
  const handleTeamCode = async (rawText: string) => {
    const teamId = parseTeamId(rawText);
    if (!teamId) {
      reportInvalidTeamCode();
      return;
    }

    options.pendingTeamId.value = teamId;

    const status: FetchTeamStatusResult = await fetchTeamStatus(teamId).catch(() => null);
    if (!status) {
      options.pendingTeamId.value = null;
      options.pendingTeamNeedsBind.value = false;
      return;
    }

    if (!isCampusMatch(status.team.route_name, options.getAuthPoint())) {
      showFailToast(MESSAGE.NotInCampus);
      options.clearPendingState();
      return;
    }

    if (isTeamBound(status)) {
      options.clearPendingState();
      navigateToTeamInfo(teamId, status.team.route_name);
      return;
    }

    if (!options.isStartOrEndAdmin()) {
      reportPermissionDenied();
      options.clearPendingState();
      return;
    }

    options.pendingTeamNeedsBind.value = true;

    if (options.pendingCheckinCode.value) {
      await bindCheckinCode({ teamId, code: options.pendingCheckinCode.value });
      return;
    }

    await promptScanCheckin();
  };

  /** 获取到签到码后进行处理 */
  const handleCheckinCode = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      reportInvalidCheckinCode();
      return;
    }

    options.pendingCheckinCode.value = trimmed;

    if (
      options.pendingTeamNeedsBind.value &&
      options.pendingTeamId.value !== null &&
      options.isStartOrEndAdmin()
    ) {
      await bindCheckinCode({ teamId: options.pendingTeamId.value, code: trimmed });
      return;
    }

    await promptTeamCodeOrInput();
  };

  /** 点击 输入签到 */
  const handleManualInputClick = () => {
    options.clearPendingState();
    options.openTeamIdInput(false);
  };

  /** 扫码签到 成功 */
  const handleScanSuccess = async (data: QrCodeData) => {
    if (options.expectedScanType.value && data.code_type !== options.expectedScanType.value) {
      showFailToast(
        options.expectedScanType.value === QR_CODE.Team
          ? MESSAGE.ScanTeamFirst
          : MESSAGE.ScanCheckinFirst
      );
      options.requestScan(options.expectedScanType.value);
      return;
    }

    options.expectedScanType.value = null;

    if (options.isProcessing.value) return;
    options.isProcessing.value = true;

    try {
      if (data.code_type === QR_CODE.Team) {
        await handleTeamCode(data.content);
      } else {
        await handleCheckinCode(data.content);
      }
    } finally {
      options.isProcessing.value = false;
    }
  };

  /** 扫码签到 报错 */
  const handleScanError = (message: string) => {
    showFailToast(message || MESSAGE.ScanStartFailed);
  };

  /** 输入签到 点击确认 */
  const handleTeamIdSubmit = async (teamId: number) => {
    if (options.isProcessing.value) return;
    options.isProcessing.value = true;
    try {
      await handleTeamCode(String(teamId));
    } finally {
      options.isProcessing.value = false;
      options.isTeamIdInputFromCheckin.value = false;
    }
  };

  /** 输入签到 点击取消 */
  const handleTeamIdCancel = () => {
    if (options.isTeamIdInputFromCheckin.value) {
      options.pendingCheckinCode.value = null;
    }
    options.isTeamIdInputFromCheckin.value = false;
  };

  return {
    handleScanSuccess,
    handleScanError,
    handleManualInputClick,
    handleTeamIdSubmit,
    handleTeamIdCancel
  };
};
