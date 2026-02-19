/** 毅行路线 */
export const WALK_ROUTE = {
  mgs: {
    name: "莫干山",
    routes: {
      mgs: {
        name: "莫干山全程"
      }
    }
  },
  pf: {
    name: "屏峰",
    routes: {
      "pf-full": {
        name: "屏峰全程"
      },
      "pf-half": {
        name: "屏峰半程"
      }
    }
  }
} as const satisfies {
  [campusId: string]: {
    name: string;
    routes: {
      [routeId: string]: {
        name: string;
      };
    };
  };
};
