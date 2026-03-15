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

// 锁定用户
export interface LockedUserItem {
  user_id: number;
  username: string;
  real_name?: string;
  fail_count: number;
  locked_at: string;
  lock_duration: number;
}

// 登录配置表单
export interface LoginForm {
  login_fail_threshold: number;
  lock_duration: number;
}

// IP规则表单
export interface IpRuleForm {
  ip_address: string;
  rule_type: "WHITELIST" | "BLACKLIST";
  description?: string;
}
