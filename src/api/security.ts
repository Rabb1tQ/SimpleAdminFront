import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

// 安全配置项
export interface SecurityConfigItem {
  id: number;
  config_key: string;
  config_value: string;
  config_type: string;
  group_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// 批量更新安全配置
export interface SecurityConfigBatchUpdate {
  configs: Array<{
    config_key: string;
    config_value: string;
  }>;
}

// IP规则
export interface IpRuleItem {
  id: number;
  ip_address: string;
  rule_type: "WHITELIST" | "BLACKLIST";
  description?: string;
  status: number;
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IpRuleListResponse {
  list: IpRuleItem[];
  total: number;
}

export interface IpRuleCreate {
  ip_address: string;
  rule_type: "WHITELIST" | "BLACKLIST";
  description?: string;
}

// 锁定用户
export interface LockedUserItem {
  user_id: number;
  username: string;
  real_name?: string;
  fail_count: number;
  locked_at: string;
  lock_duration: number;
}

export interface LockedUserListResponse {
  list: LockedUserItem[];
  total: number;
}

// 获取安全配置
export const getSecurityConfig = (group?: string) => {
  return http.request<ApiResponse<SecurityConfigItem[]>>(
    "get",
    "/api/security/config",
    {
      params: { group }
    }
  );
};

// 更新安全配置
export const updateSecurityConfig = (data: SecurityConfigBatchUpdate) => {
  return http.request<ApiResponse<null>>("put", "/api/security/config", {
    data
  });
};

// 获取IP规则列表
export const getIpRuleList = (params?: {
  page?: number;
  page_size?: number;
  rule_type?: string;
  ip_address?: string;
}) => {
  return http.request<ApiResponse<IpRuleListResponse>>(
    "get",
    "/api/security/ip-rule/list",
    {
      params
    }
  );
};

// 添加IP规则
export const createIpRule = (data: IpRuleCreate) => {
  return http.request<ApiResponse<IpRuleItem>>(
    "post",
    "/api/security/ip-rule",
    {
      data
    }
  );
};

// 删除IP规则
export const deleteIpRule = (ruleId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/security/ip-rule/${ruleId}`
  );
};

// 更新IP规则状态
export const updateIpRuleStatus = (ruleId: number, status: number) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/security/ip-rule/${ruleId}/status`,
    {
      data: { status }
    }
  );
};

// 获取锁定用户列表
export const getLockedUsers = (params?: {
  page?: number;
  page_size?: number;
  username?: string;
}) => {
  return http.request<ApiResponse<LockedUserListResponse>>(
    "get",
    "/api/security/locked-users",
    {
      params
    }
  );
};

// 解锁用户
export const unlockUser = (userId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/security/locked-users/${userId}`
  );
};
