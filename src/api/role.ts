import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  desc?: string;
  status: number;
  created_at: string;
}

export interface RoleListResponse {
  items: RoleItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoleCreate {
  name: string;
  code: string;
  desc?: string;
  menu_ids?: number[];
}

export interface RoleUpdate {
  name?: string;
  desc?: string;
  status?: number;
  menu_ids?: number[];
}

export interface RoleDetail extends RoleItem {
  menu_ids: number[];
}

/** 获取角色列表 */
export const getRoleList = (params?: {
  page?: number;
  page_size?: number;
  name?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<RoleListResponse>>(
    "get",
    "/api/system/role/list",
    {
      params
    }
  );
};

/** 获取所有角色 */
export const getAllRoles = () => {
  return http.request<
    ApiResponse<Array<{ id: number; name: string; code: string }>>
  >("get", "/api/system/role/all");
};

/** 获取角色详情 */
export const getRoleDetail = (roleId: number) => {
  return http.request<ApiResponse<RoleDetail>>(
    "get",
    `/api/system/role/${roleId}`
  );
};

/** 创建角色 */
export const createRole = (data: RoleCreate) => {
  return http.request<ApiResponse<{ id: number }>>("post", "/api/system/role", {
    data
  });
};

/** 更新角色 */
export const updateRole = (roleId: number, data: RoleUpdate) => {
  return http.request<ApiResponse<null>>("put", `/api/system/role/${roleId}`, {
    data
  });
};

/** 删除角色 */
export const deleteRole = (roleId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/role/${roleId}`
  );
};
