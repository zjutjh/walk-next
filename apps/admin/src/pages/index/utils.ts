import { useMutation } from "@tanstack/vue-query";
import { AdminAPI, QR_CODE } from "api/types/admin";
import { showFailToast } from "vant";
import type { Ref } from "vue";
import type { Router } from "vue-router";

import type { QrCodeData } from "@/composables/use-qr-scanner";
import { walkAdminService } from "@/utils";
import { CAMPUS_LIST, CAMPUS_POINT_LIST_MAP, CAMPUS_ROUTE_LIST_MAP } from "@/walk-config";

interface CheckinHandlersOptions {
  router: Router;
  getAuthPoint: () => string;
  isProcessing: Ref<boolean>;
  requestScan: () => void;
}

const MESSAGE = {
  InvalidTeamCode: "团队码内容不合法",
  FetchTeamStatusFailed: "获取团队状态失败",
  ScanStartFailed: "扫码启动失败",
  NotInCampus: "请注意该队伍不属于当前校区",
  ScanCheckinCode: "识别到签到码，请扫团队码"
} as const;

const parseTeamId = (rawText: string) => {
  const trimmed = rawText.trim();
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
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

const isCampusMatch = (teamRouteName: string, adminPoint: string) => {
  const teamCampusId = getCampusIdByRoute(teamRouteName);
  const adminCampusId = getCampusIdByPoint(adminPoint);
  if (!adminCampusId) return true;
  if (!teamCampusId) return true;
  return teamCampusId === adminCampusId;
};

export const createCheckinHandlers = (options: CheckinHandlersOptions) => {
  const { router } = options;

  const { mutateAsync: fetchTeamStatus } = useMutation({
    mutationFn: (teamId: number) => walkAdminService.GetTeamStatus({ team_id: teamId }),
    onError: (err: Error) => {
      showFailToast(err.message || MESSAGE.FetchTeamStatusFailed);
    }
  });

  const navigateToTeamInfo = (teamId: number, routeName?: string) => {
    const campusId = getCampusIdByRoute(routeName) ?? getCampusIdByPoint(options.getAuthPoint());
    if (!campusId) return;
    router.push({ path: `/team-list/${campusId}`, query: { team_id: String(teamId) } });
  };

  const handleTeamCode = async (rawText: string) => {
    const teamId = parseTeamId(rawText);
    if (!teamId) {
      showFailToast(MESSAGE.InvalidTeamCode);
      return;
    }

    const status: AdminAPI.GetTeamStatusResponse | null = await fetchTeamStatus(teamId).catch(
      () => null
    );
    if (!status) return;

    if (!isCampusMatch(status.team.route_name, options.getAuthPoint())) {
      showFailToast(MESSAGE.NotInCampus);
    }

    navigateToTeamInfo(teamId, status.team.route_name);
  };

  const handleScanSuccess = async (data: QrCodeData) => {
    if (data.code_type !== QR_CODE.Team) {
      showFailToast(MESSAGE.ScanCheckinCode);
      options.requestScan();
      return;
    }

    if (options.isProcessing.value) return;
    options.isProcessing.value = true;

    try {
      await handleTeamCode(data.content);
    } finally {
      options.isProcessing.value = false;
    }
  };

  const handleScanError = (message: string) => {
    showFailToast(message || MESSAGE.ScanStartFailed);
  };

  const handleTeamIdSubmit = async (teamId: number) => {
    if (options.isProcessing.value) return;
    options.isProcessing.value = true;
    try {
      await handleTeamCode(String(teamId));
    } finally {
      options.isProcessing.value = false;
    }
  };

  return {
    handleScanSuccess,
    handleScanError,
    handleTeamIdSubmit
  };
};
