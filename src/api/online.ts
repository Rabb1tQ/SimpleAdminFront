import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  msg?: string;
  data: T;
};

export interface OnlineUser {
  user_id: number;
  username: string;
  real_name: string;
  ip: string;
  browser: string;
  os: string;
  login_time: string;
  last_access: string;
}

export interface OnlineListResponse {
  items: OnlineUser[];
  total: number;
}

/** 获取在线用户列表 */
export const getOnlineList = (params?: { username?: string }) => {
  return http.request<ApiResponse<OnlineListResponse>>(
    "get",
    "/api/system/online/list",
    { params }
  );
};

/** 强制下线用户 */
export const forceLogout = (userId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/online/${userId}`
  );
};
