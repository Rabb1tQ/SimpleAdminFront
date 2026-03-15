import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data?: T;
};

// 字典类型相关类型
export interface DictTypeItem {
  id: number;
  name: string;
  code: string;
  status: number;
  remark?: string;
  created_at: string;
}

export interface DictTypeListResponse {
  items: DictTypeItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 字典数据相关类型
export interface DictDataItem {
  id: number;
  dict_type_id: number;
  dict_code?: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  css_class?: string;
  list_class?: string;
  is_default: boolean;
}

export interface DictDataListResponse {
  items: DictDataItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 字典类型 API
export const getDictTypeList = (params?: {
  page?: number;
  page_size?: number;
  name?: string;
  code?: string;
}) => {
  return http.request<ApiResponse<DictTypeListResponse>>(
    "get",
    "/api/system/dict/type/list",
    { params }
  );
};

export const getAllDictTypes = () => {
  return http.request<ApiResponse<DictTypeItem[]>>(
    "get",
    "/api/system/dict/type/all"
  );
};

export const getDictType = (typeId: number) => {
  return http.request<ApiResponse<DictTypeItem>>(
    "get",
    `/api/system/dict/type/${typeId}`
  );
};

export interface DictTypeCreate {
  name: string;
  code: string;
  status?: number;
  remark?: string;
}

export interface DictTypeUpdate {
  name?: string;
  code?: string;
  status?: number;
  remark?: string;
}

export const createDictType = (data: DictTypeCreate) => {
  return http.request<ApiResponse<{ id: number }>>(
    "post",
    "/api/system/dict/type",
    {
      data
    }
  );
};

export const updateDictType = (typeId: number, data: DictTypeUpdate) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/system/dict/type/${typeId}`,
    {
      data
    }
  );
};

export const deleteDictType = (typeId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/dict/type/${typeId}`
  );
};

// 字典数据 API
export const getDictDataList = (params?: {
  page?: number;
  page_size?: number;
  dict_type_id?: number;
  label?: string;
  status?: number;
}) => {
  return http.request<ApiResponse<DictDataListResponse>>(
    "get",
    "/api/system/dict/data/list",
    { params }
  );
};

export const getDictDataByCode = (code: string) => {
  return http.request<ApiResponse<DictDataItem[]>>(
    "get",
    `/api/system/dict/data/code/${code}`
  );
};

export interface DictDataCreate {
  dict_type_id: number;
  label: string;
  value: string;
  sort?: number;
  status?: number;
  css_class?: string;
  list_class?: string;
  is_default?: boolean;
}

export interface DictDataUpdate {
  label?: string;
  value?: string;
  sort?: number;
  status?: number;
  css_class?: string;
  list_class?: string;
  is_default?: boolean;
}

export const createDictData = (data: DictDataCreate) => {
  return http.request<ApiResponse<{ id: number }>>(
    "post",
    "/api/system/dict/data",
    {
      data
    }
  );
};

export const updateDictData = (dataId: number, data: DictDataUpdate) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/system/dict/data/${dataId}`,
    {
      data
    }
  );
};

export const deleteDictData = (dataId: number) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/api/system/dict/data/${dataId}`
  );
};
