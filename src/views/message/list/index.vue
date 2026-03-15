<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import {
  getMessageList,
  markMessageRead,
  markMessageUnread,
  deleteMessage,
  readAllMessages
} from "@/api/message";
import { useMessageStoreHook } from "@/store/modules/message";
import type { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import Refresh from "~icons/ep/refresh";
import View from "~icons/ep/view";
import Delete from "~icons/ep/delete";
import Check from "~icons/ep/check";

defineOptions({
  name: "MessageList"
});

const route = useRoute();
const messageStore = useMessageStoreHook();

const loading = ref(false);
const dataList = ref([]);
const form = reactive({
  type: "",
  is_read: ""
});
const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

// 消息详情弹窗
const detailVisible = ref(false);
const detailData = ref({
  id: 0,
  title: "",
  content: "",
  type: "",
  is_read: false,
  created_at: ""
});

const columns: TableColumnList = [
  {
    label: "消息标题",
    prop: "title",
    minWidth: 180,
    showOverflowTooltip: true
  },
  {
    label: "消息内容",
    prop: "content",
    minWidth: 250,
    showOverflowTooltip: true
  },
  {
    label: "消息类型",
    prop: "type",
    width: 100,
    formatter: ({ type }) => (type === "SYSTEM" ? "系统通知" : "业务通知")
  },
  {
    label: "状态",
    prop: "is_read",
    width: 80,
    slot: "is_read"
  },
  {
    label: "发送时间",
    prop: "created_at",
    width: 170,
    formatter: ({ created_at }) =>
      dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
  },
  {
    label: "操作",
    fixed: "right",
    width: 180,
    slot: "operation"
  }
];

async function onSearch() {
  loading.value = true;
  try {
    const { data } = await getMessageList({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      type: form.type || undefined,
      is_read: form.is_read !== "" ? form.is_read === "true" : undefined
    });
    dataList.value = data.items;
    pagination.total = data.total;
  } catch {
    message("获取消息列表失败", { type: "error" });
  } finally {
    loading.value = false;
  }
  return Promise.resolve();
}

function handleSizeChange(val: number) {
  pagination.pageSize = val;
  onSearch();
}

function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

// 更新右上角未读数量
async function updateUnreadCount() {
  await messageStore.fetchUnreadCount();
}

// 查看消息详情
async function handleView(row) {
  detailData.value = {
    id: row.id,
    title: row.title,
    content: row.content || "暂无内容",
    type: row.type,
    is_read: row.is_read,
    created_at: row.created_at
  };
  detailVisible.value = true;

  // 如果是未读消息，自动标记为已读
  if (!row.is_read) {
    try {
      await markMessageRead(row.id);
      onSearch();
      updateUnreadCount();
    } catch {
      // 忽略错误
    }
  }
}

async function handleRead(row) {
  try {
    await markMessageRead(row.id);
    message("已标记为已读", { type: "success" });
    onSearch();
    updateUnreadCount();
  } catch {
    message("操作失败", { type: "error" });
  }
}

async function handleUnread(row) {
  try {
    await markMessageUnread(row.id);
    message("已标记为未读", { type: "success" });
    onSearch();
  } catch {
    message("操作失败", { type: "error" });
  }
}

async function handleDelete(row) {
  try {
    await deleteMessage(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  } catch {
    message("删除失败", { type: "error" });
  }
}

async function handleReadAll() {
  try {
    await readAllMessages();
    message("已全部标记为已读", { type: "success" });
    onSearch();
    updateUnreadCount();
  } catch {
    message("操作失败", { type: "error" });
  }
}

function resetForm() {
  form.type = "";
  form.is_read = "";
  pagination.currentPage = 1;
  onSearch();
}

// 根据 URL 参数打开指定消息
async function openMessageFromUrl() {
  const messageId = route.query.id;
  if (messageId) {
    const id = Number(messageId);
    if (!isNaN(id)) {
      // 先加载列表，然后找到对应的消息
      await onSearch();
      const targetMessage = dataList.value.find(item => item.id === id);
      if (targetMessage) {
        handleView(targetMessage);
      }
    }
  }
}

onMounted(() => {
  onSearch().then(() => {
    openMessageFromUrl();
  });
});
</script>

<template>
  <div class="main">
    <el-form
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="消息类型：" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择"
          clearable
          class="w-45!"
        >
          <el-option label="系统通知" value="SYSTEM" />
          <el-option label="业务通知" value="BUSINESS" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="is_read">
        <el-select
          v-model="form.is_read"
          placeholder="请选择"
          clearable
          class="w-45!"
        >
          <el-option label="未读" value="false" />
          <el-option label="已读" value="true" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="消息中心" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="success"
          :icon="useRenderIcon(Check)"
          @click="handleReadAll"
        >
          一键已读
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #is_read="{ row }">
            <el-tag :type="row.is_read ? 'success' : 'warning'">
              {{ row.is_read ? "已读" : "未读" }}
            </el-tag>
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              v-if="row.is_read"
              class="reset-margin"
              link
              type="warning"
              :size="size"
              @click="handleUnread(row)"
            >
              标为未读
            </el-button>
            <el-button
              v-else
              class="reset-margin"
              link
              type="success"
              :size="size"
              @click="handleRead(row)"
            >
              标为已读
            </el-button>
            <el-popconfirm
              title="是否确认删除此消息？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="danger"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 消息详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="消息详情"
      width="600px"
      destroy-on-close
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="消息标题">
          {{ detailData.title }}
        </el-descriptions-item>
        <el-descriptions-item label="消息类型">
          {{ detailData.type === "SYSTEM" ? "系统通知" : "业务通知" }}
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ dayjs(detailData.created_at).format("YYYY-MM-DD HH:mm:ss") }}
        </el-descriptions-item>
        <el-descriptions-item label="消息内容">
          <div class="whitespace-pre-wrap">{{ detailData.content }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
