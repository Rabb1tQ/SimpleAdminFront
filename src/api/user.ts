import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

export type UserResult = {
  code: number;
  message: string;
  data: {
    avatar: string;
    username: string;
    nickname: string;
    roles: Array<string>;
    permissions: Array<string>;
    accessToken: string;
    refreshToken: string;
    expires: Date;
  };
};

export type RefreshTokenResult = {
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/api/auth/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (refreshToken: string) => {
  return http.request<RefreshTokenResult>("post", "/api/auth/refresh", {
    data: { refresh_token: refreshToken }
  });
};

/** 获取验证码 */
export const getCaptcha = () => {
  return http.request<ApiResponse<{ key: string; image: string }>>(
    "get",
    "/api/auth/captcha"
  );
};

export interface UserItem {
  id: number;
  username: string;
  real_name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  is_superuser: boolean;
  created_at: string;
  roles: string[];
  role_ids: number[];
}

export interface UserListResponse {
  items: UserItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UserCreate {
  username: string;
  password: string;
  real_name: string;
  email?: string;
  phone?: string;
  desc?: string;
  avatar?: string;
  home_path?: string;
  status?: number;
  role_ids?: number[];
}

export interface UserUpdate {
  real_name?: string;
  email?: string;
  phone?: string;
  desc?: string;
  avatar?: string;
  home_path?: string;
  status?: number;
  role_ids?: number[];
}

/** 获取用户列表 */
export const getUserList = (params?: {
  page?: number;
  page_size?: number;
  username?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<UserListResponse>>(
    "get",
    "/api/system/user/list",
    {
      params
    }
  );
};

/** 创建用户 */
export const createUser = (data: UserCreate) => {
  return http.request<ApiResponse<{ id: number }>>("post", "/api/system/user", {
    data
  });
};

/** 更新用户 */
export const updateUser = (userId: number, data: UserUpdate) => {
  return http.request<ApiResponse<null>>("put", `/api/system/user/${userId}`, {
    data
  });
};

/** 删除用户 */
export const deleteUser = (userId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/user/${userId}`
  );
};

/** 重置密码 */
export const resetPassword = (userId: number, new_password: string) => {
  return http.request<ApiResponse<null>>(
    "post",
    `/api/system/user/${userId}/reset-password?new_password=${encodeURIComponent(new_password)}`
  );
};
