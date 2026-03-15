import { http } from "@/utils/http";

type ApiResponse<T = any> = {
  code: number;
  message: string;
  data: T;
};

export interface MessageItem {
  id: number;
  title: string;
  content: string;
  type: string;
  sender_id: number | null;
  sender_tenant_id: number | null;
  receiver_id: number;
  is_read: number;
  read_at: string | null;
  created_at: string;
}

export interface MessageListResponse {
  items: MessageItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MessageSend {
  title: string;
  content?: string;
  type: string;
  receiver_type: string;
  receiver_ids: number[];
}

export interface MessageSendResponse {
  send_count: number;
}

export interface MessageSendLogItem {
  id: number;
  title: string;
  content: string | null;
  type: string;
  sender_id: number | null;
  sender_tenant_id: number | null;
  receiver_type: string;
  receiver_ids: string | null;
  send_count: number;
  created_at: string;
}

export interface MessageSendLogListResponse {
  items: MessageSendLogItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** 获取消息列表 */
export const getMessageList = (params?: {
  page?: number;
  page_size?: number;
  type?: string;
  is_read?: boolean;
}) => {
  return http.request<ApiResponse<MessageListResponse>>(
    "get",
    "/api/message/list",
    { params }
  );
};

/** 获取未读消息数量 */
export const getUnreadCount = () => {
  return http.request<ApiResponse<UnreadCountResponse>>(
    "get",
    "/api/message/unread-count"
  );
};

/** 标记消息已读 */
export const markMessageRead = (messageId: number) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/message/${messageId}/read`
  );
};

/** 标记消息未读 */
export const markMessageUnread = (messageId: number) => {
  return http.request<ApiResponse<null>>(
    "put",
    `/api/message/${messageId}/unread`
  );
};

/** 一键全部已读 */
export const readAllMessages = () => {
  return http.request<ApiResponse<null>>("put", "/api/message/read-all");
};

/** 删除消息 */
export const deleteMessage = (messageId: number) => {
  return http.request<ApiResponse<null>>("delete", `/api/message/${messageId}`);
};

/** 发送消息 */
export const sendMessage = (data: MessageSend) => {
  return http.request<ApiResponse<MessageSendResponse>>(
    "post",
    "/api/message/send",
    { data }
  );
};

/** 获取发送记录 */
export const getSendLog = (params?: { page?: number; page_size?: number }) => {
  return http.request<ApiResponse<MessageSendLogListResponse>>(
    "get",
    "/api/message/send-log",
    { params }
  );
};
