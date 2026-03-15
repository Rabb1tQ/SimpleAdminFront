import { http } from "@/utils/http";

/** 后端统一响应格式 */
type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

/** 路由数据 */
type RouteData = Array<any>;

/** 前端期望的响应格式 */
type Result = {
  success: boolean;
  data: RouteData;
};

/** 获取异步路由 */
export const getAsyncRoutes = () => {
  return http
    .request<ApiResponse<RouteData>>("get", "/api/system/menu/all")
    .then(res => {
      return {
        success: res.code === 0,
        data: res.data || []
      } as Result;
    })
    .catch(error => {
      console.error("获取路由数据失败:", error);
      // 返回空数组，避免页面卡住
      return {
        success: false,
        data: []
      } as Result;
    });
};
