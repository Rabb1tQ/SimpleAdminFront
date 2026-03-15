import { http } from "@/utils/http";

/** 后端统一响应格式 */
type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

/** 菜单列表项 */
export interface MenuItem {
  id: number;
  parent_id: number;
  name: string;
  path: string;
  component: string | null;
  title: string;
  icon: string | null;
  sort: number;
  status: number;
  hide_in_menu: boolean;
  keep_alive: boolean;
  permission: string | null;
  menu_type: number;
  created_at: string;
  children?: MenuItem[];
}

/** 菜单创建参数 */
export interface MenuCreate {
  parent_id?: number;
  name: string;
  path: string;
  component?: string;
  title: string;
  icon?: string;
  sort?: number;
  hide_in_menu?: boolean;
  keep_alive?: boolean;
  permission?: string;
  menu_type?: number;
}

/** 菜单更新参数 */
export interface MenuUpdate {
  parent_id?: number;
  name?: string;
  path?: string;
  component?: string;
  title?: string;
  icon?: string;
  sort?: number;
  status?: number;
  hide_in_menu?: boolean;
  keep_alive?: boolean;
  permission?: string;
  menu_type?: number;
}

/** 获取菜单列表（树形） */
export const getMenuList = () => {
  return http.request<ApiResponse<MenuItem[]>>("get", "/api/system/menu/list");
};

/** 获取菜单详情 */
export const getMenuDetail = (id: number) => {
  return http.request<ApiResponse<MenuItem>>("get", `/api/system/menu/${id}`);
};

/** 创建菜单 */
export const createMenu = (data: MenuCreate) => {
  return http.request<ApiResponse<{ id: number }>>("post", "/api/system/menu", {
    data
  });
};

/** 更新菜单 */
export const updateMenu = (id: number, data: MenuUpdate) => {
  return http.request<ApiResponse<null>>("put", `/api/system/menu/${id}`, {
    data
  });
};

/** 删除菜单 */
export const deleteMenu = (id: number) => {
  return http.request<ApiResponse<null>>("delete", `/api/system/menu/${id}`);
};
