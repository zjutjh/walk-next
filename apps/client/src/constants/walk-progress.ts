import type { WalkPhase } from "api/types/client";

interface WalkStage {
  phase: WalkPhase;
  title: string;
  description: string;
  icon: string;
}

export const WALK_STAGES = [
  {
    phase: "registration",
    title: "注册组队",
    description: "注册组队说明",
    icon: "friends"
  },
  {
    phase: "submission",
    title: "抢票提交",
    description: "抢票提交说明",
    icon: "clock-o"
  },
  {
    phase: "adjustment",
    title: "调整队伍",
    description: "调整队伍说明",
    icon: "setting-o"
  },
  {
    phase: "preparation",
    title: "毅行筹备",
    description: "毅行筹备说明",
    icon: "records"
  },
  {
    phase: "activity",
    title: "正式毅行",
    description: "正式毅行说明",
    icon: "flag-o"
  }
] as const satisfies WalkStage[];

/** 不在活动时期内（phase 为空字符串）时展示的阶段 */
export const INACTIVE_WALK_STAGE = {
  phase: "",
  title: "暂未开放",
  description: "当前不在毅行活动时期内",
  icon: "info-o"
} as const satisfies WalkStage;
