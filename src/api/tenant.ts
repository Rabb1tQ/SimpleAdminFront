import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

export interface TenantItem {
  id: number;
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: number;
  expire_at?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantListResponse {
  items: TenantItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TenantCreate {
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: number;
  expire_at?: string;
  remark?: string;
}

export interface TenantUpdate {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: number;
  expire_at?: string;
  remark?: string;
}

export interface TenantSelect {
  id: number;
  name: string;
  code: string;
}

/** 获取租户列表 */
export const getTenantList = (params?: {
  page?: number;
  page_size?: number;
  name?: string;
  code?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<TenantListResponse>>(
    "get",
    "/api/system/tenant/list",
    {
      params
    }
  );
};

/** 获取所有启用的租户 */
export const getAllTenants = () => {
  return http.request<ApiResponse<TenantSelect[]>>(
    "get",
    "/api/system/tenant/all"
  );
};

/** 获取租户详情 */
export const getTenantDetail = (tenantId: number) => {
  return http.request<ApiResponse<TenantItem>>(
    "get",
    `/api/system/tenant/${tenantId}`
  );
};

/** 创建租户 */
export const createTenant = (data: TenantCreate) => {
  return http.request<ApiResponse<{ id: number }>>(
    "post",
    "/api/system/tenant",
    {
      data
    }
  );
};

/** 更新租户 */
export const updateTenant = (tenantId: number, data: TenantUpdate) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/system/tenant/${tenantId}`,
    {
      data
    }
  );
};

/** 删除租户 */
export const deleteTenant = (tenantId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/tenant/${tenantId}`
  );
};
