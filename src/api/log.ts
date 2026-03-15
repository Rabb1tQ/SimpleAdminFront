import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data?: T;
};

// 操作日志相关类型
export interface OperationLogItem {
  id: number;
  user_id: number;
  username: string;
  module: string;
  action: string;
  method: string;
  url: string;
  ip: string;
  status: number;
  duration: number;
  created_at: string;
  user_agent?: string;
  request_data?: string;
  response_data?: string;
  error_msg?: string;
}

export interface OperationLogListResponse {
  items: OperationLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 登录日志相关类型
export interface LoginLogItem {
  id: number;
  user_id: number;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: number;
  msg: string;
  login_time: string;
}

export interface LoginLogListResponse {
  items: LoginLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 获取操作日志列表
export const getOperationLogList = (params?: {
  page?: number;
  page_size?: number;
  username?: string;
  module?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<OperationLogListResponse>>(
    "get",
    "/api/system/log/list",
    { params }
  );
};

// 获取操作日志详情
export const getOperationLogDetail = (logId: number) => {
  return http.request<ApiResponse<OperationLogItem>>(
    "get",
    `/api/system/log/${logId}`
  );
};

// 获取登录日志列表
export const getLoginLogList = (params?: {
  page?: number;
  page_size?: number;
  username?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<LoginLogListResponse>>(
    "get",
    "/api/system/log/login/list",
    { params }
  );
};

// 获取登录日志详情
export const getLoginLogDetail = (logId: number) => {
  return http.request<ApiResponse<LoginLogItem>>(
    "get",
    `/api/system/log/login/${logId}`
  );
};

// 导出操作日志
export const exportOperationLog = (params?: {
  username?: string;
  module?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return http.request<Blob>("get", "/api/system/log/operation-export", {
    params,
    responseType: "blob"
  });
};

// 导出登录日志
export const exportLoginLog = (params?: {
  username?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return http.request<Blob>("get", "/api/system/log/login-export", {
    params,
    responseType: "blob"
  });
};
