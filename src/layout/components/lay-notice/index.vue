<script setup lang="ts">
import { ref, onMounted, provide, computed } from "vue";
import { useRouter } from "vue-router";
import NoticeList from "./components/NoticeList.vue";
import BellIcon from "~icons/ep/bell";
import {
  getMessageList,
  type MessageItem
} from "@/api/message";
import { useMessageStoreHook } from "@/store/modules/message";

const router = useRouter();
const messageStore = useMessageStoreHook();
const noticesNum = computed(() => messageStore.unreadCount);
const notices = ref([
  {
    key: "1",
    name: "消息",
    list: [] as Array<{
      id: number;
      avatar: string;
      title: string;
      description: string;
      datetime: string;
      type: string;
      status?: "primary" | "success" | "warning" | "info" | "danger";
    }>,
    emptyText: "暂无消息"
  }
]);
const activeKey = ref("1");
const loading = ref(false);

// 获取未读消息数量
async function loadUnreadCount() {
  await messageStore.fetchUnreadCount();
}

// 获取消息列表（点击时加载）
async function loadMessages() {
  if (loading.value) return;

  loading.value = true;
  try {
    const { data } = await getMessageList({ page: 1, page_size: 10 });
    if (data?.items) {
      const messages = data.items as MessageItem[];

      notices.value[0].list = messages.map(msg => ({
        id: msg.id,
        avatar: "https://xiaoxian521.github.io/hyperlink/svg/smile1.svg",
        title: msg.title,
        description: msg.content,
        datetime: formatTime(msg.created_at),
        type: msg.type,
        status: msg.is_read ? "info" : ("primary" as const)
      }));
    }
  } catch (error) {
    console.error("获取消息失败:", error);
  } finally {
    loading.value = false;
  }
}

// 格式化时间
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return dateStr.split("T")[0];
}

// 下拉框显示时加载消息
function handleVisibleChange(visible: boolean) {
  if (visible) {
    loadMessages();
  }
}

// 点击消息项跳转到消息中心
function handleMessageClick(messageId: number) {
  router.push({
    path: "/message/list/index",
    query: { id: messageId }
  });
}

// 提供给子组件的方法和状态
provide("handleMessageClick", handleMessageClick);
provide("loadUnreadCount", loadUnreadCount);

// 暴露给外部调用的方法
defineExpose({
  loadUnreadCount
});

onMounted(() => {
  loadUnreadCount();
});
</script>

<template>
  <el-dropdown
    trigger="click"
    placement="bottom-end"
    @visible-change="handleVisibleChange"
  >
    <span
      :class="[
        'dropdown-badge',
        'navbar-bg-hover',
        'select-none',
        Number(noticesNum) !== 0 && 'mr-[10px]'
      ]"
    >
      <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99">
        <span class="header-notice-icon">
          <IconifyIconOffline :icon="BellIcon" />
        </span>
      </el-badge>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-tabs
          v-model="activeKey"
          :stretch="true"
          class="dropdown-tabs"
          :style="{ width: notices.length === 0 ? '200px' : '330px' }"
        >
          <el-empty
            v-if="notices.length === 0 || notices[0].list.length === 0"
            description="暂无消息"
            :image-size="60"
          />
          <span v-else>
            <template v-for="item in notices" :key="item.key">
              <el-tab-pane
                :label="`${item.name}(${noticesNum})`"
                :name="`${item.key}`"
              >
                <el-scrollbar max-height="330px">
                  <div class="noticeList-container">
                    <NoticeList :list="item.list" :emptyText="item.emptyText" />
                  </div>
                </el-scrollbar>
              </el-tab-pane>
            </template>
          </span>
        </el-tabs>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 48px;
  cursor: pointer;

  .header-notice-icon {
    font-size: 18px;
  }
}

.dropdown-tabs {
  .noticeList-container {
    padding: 15px 24px 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap)::after {
    height: 1px;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0 36px;
  }
}
</style>
