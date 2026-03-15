import type { OptionsType } from "@/components/ReSegmented";

/** 菜单类型选项 */
const menuTypeOptions: Array<OptionsType> = [
  {
    label: "目录",
    value: 1
  },
  {
    label: "菜单",
    value: 2
  },
  {
    label: "按钮",
    value: 3
  }
];

/** 是否显示菜单 */
const showLinkOptions: Array<OptionsType> = [
  {
    label: "显示",
    tip: "会在菜单中显示",
    value: false
  },
  {
    label: "隐藏",
    tip: "不会在菜单中显示",
    value: true
  }
];

/** 是否缓存页面 */
const keepAliveOptions: Array<OptionsType> = [
  {
    label: "缓存",
    tip: "会保存该页面的整体状态，刷新后会清空状态",
    value: true
  },
  {
    label: "不缓存",
    tip: "不会保存该页面的整体状态",
    value: false
  }
];

/** 状态选项 */
const statusOptions: Array<OptionsType> = [
  {
    label: "启用",
    value: 1
  },
  {
    label: "禁用",
    value: 0
  }
];

export { menuTypeOptions, showLinkOptions, keepAliveOptions, statusOptions };
