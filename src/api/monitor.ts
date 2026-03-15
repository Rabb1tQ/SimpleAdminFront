import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

export interface ServerInfo {
  cpu: {
    usage: number;
    core: number;
    model: string;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  system: {
    os: string;
    arch: string;
    hostname: string;
    uptime: number;
  };
}

export interface RedisInfo {
  version: string;
  mode: string;
  connected_clients: number;
  used_memory: number;
  total_memory: number;
  uptime_in_seconds: number;
  keys: number;
}

export interface DatabaseInfo {
  version: string;
  database: string;
  size: number;
  tables: number;
  connections: number;
}

/** 获取服务器信息 */
export const getServerInfo = () => {
  return http.request<ApiResponse<ServerInfo>>(
    "get",
    "/api/system/monitor/server"
  );
};

/** 获取Redis信息 */
export const getRedisInfo = () => {
  return http.request<ApiResponse<RedisInfo>>(
    "get",
    "/api/system/monitor/redis"
  );
};

/** 获取数据库信息 */
export const getDatabaseInfo = () => {
  return http.request<ApiResponse<DatabaseInfo>>(
    "get",
    "/api/system/monitor/database"
  );
};
