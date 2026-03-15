import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  msg?: string;
  data: T;
};

export interface ProfileData {
  id: number;
  username: string;
  real_name: string;
  email?: string;
  phone?: string;
  desc?: string;
  avatar?: string;
  home_path?: string;
}

/** 获取个人信息 */
export const getProfile = () => {
  return http.request<ApiResponse<ProfileData>>("get", "/api/system/profile");
};

/** 更新个人信息 */
export const updateProfile = (data: object) => {
  return http.request<ApiResponse<null>>("put", "/api/system/profile", {
    data
  });
};

/** 修改密码 */
export const changePassword = (data: object) => {
  return http.request<ApiResponse<null>>(
    "put",
    "/api/system/profile/password",
    {
      data
    }
  );
};
