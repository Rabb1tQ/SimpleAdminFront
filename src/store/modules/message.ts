import { defineStore } from "pinia";
import { store } from "../utils";
import { getUnreadCount } from "@/api/message";

export const useMessageStore = defineStore("message", {
  state: () => ({
    /** 未读消息数量 */
    unreadCount: 0
  }),
  actions: {
    /** 设置未读消息数量 */
    SET_UNREAD_COUNT(count: number) {
      this.unreadCount = count;
    },
    /** 获取未读消息数量 */
    async fetchUnreadCount() {
      try {
        const { data } = await getUnreadCount();
        this.unreadCount = data?.count || 0;
      } catch (error) {
        console.error("获取未读消息数量失败:", error);
      }
    },
    /** 清除未读消息数量 */
    clearUnreadCount() {
      this.unreadCount = 0;
    }
  }
});

export function useMessageStoreHook() {
  return useMessageStore(store);
}
