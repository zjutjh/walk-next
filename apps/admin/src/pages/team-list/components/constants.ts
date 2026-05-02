import type { SearchType } from "api/types/admin";
import type { DropdownItemOption } from "vant";

/** 毅行队伍的搜索类型 */
export const TEAM_SEARCH_TYPE = {
  captain_phone: {
    text: "队长联系电话",
    abbr: "电话",
    icon: "phone-o"
  },
  captain_name: {
    text: "队长姓名",
    abbr: "姓名",
    icon: "contact-o"
  },
  team_id: {
    text: "队伍ID",
    abbr: "ID",
    icon: "flag-o"
  }
} as const satisfies Record<
  SearchType,
  {
    /** 中文全名 */
    text: string;
    /** 显示在搜索输入框左侧的简写 */
    abbr: string;
    /** 图标 */
    icon: string;
  }
>;

interface TeamSearchTypeOption extends DropdownItemOption {
  value: SearchType;
}
/** 毅行队伍的搜索类型 DropdownItem Options */
export const TEAM_SEARCH_TYPE_OPTIONS = (Object.keys(TEAM_SEARCH_TYPE) as SearchType[]).map(
  (key) => ({
    value: key,
    text: `按 ${TEAM_SEARCH_TYPE[key].text} 搜索`,
    icon: TEAM_SEARCH_TYPE[key].icon
  })
) satisfies Array<TeamSearchTypeOption>;
