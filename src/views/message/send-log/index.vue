<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { getSendLog } from "@/api/message";
import type { PaginationProps } from "@pureadmin/table";
import dayjs from "dayjs";
import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "MessageSendLog"
});

const loading = ref(false);
const dataList = ref([]);
const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const columns: TableColumnList = [
  {
    label: "消息标题",
    prop: "title",
    minWidth: 200
  },
  {
    label: "消息类型",
    prop: "type",
    width: 100,
    formatter: ({ type }) => (type === "SYSTEM" ? "系统通知" : "业务通知")
  },
  {
    label: "接收对象类型",
    prop: "receiver_type",
    width: 120,
    formatter: ({ receiver_type }) => {
      const map = {
        ALL: "全员",
        TENANT: "指定租户",
        ROLE: "指定角色",
        USER: "指定用户"
      };
      return map[receiver_type] || receiver_type;
    }
  },
  {
    label: "发送数量",
    prop: "send_count",
    width: 100
  },
  {
    label: "发送时间",
    prop: "created_at",
    width: 180,
    formatter: ({ created_at }) =>
      dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
  }
];

async function onSearch() {
  loading.value = true;
  try {
    const { data } = await getSendLog({
      page: pagination.currentPage,
      page_size: pagination.pageSize
    });
    dataList.value = data.items;
    pagination.total = data.total;
  } catch {
    message("获取发送记录失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

function handleSizeChange(val: number) {
  pagination.pageSize = val;
  onSearch();
}

function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

onMounted(() => {
  onSearch();
});
</script>

<template>
  <div class="main">
    <PureTableBar title="发送记录" :columns="columns" @refresh="onSearch">
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
        />
      </template>
    </PureTableBar>
  </div>
</template>
