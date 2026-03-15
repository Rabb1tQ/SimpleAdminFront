<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { message } from "@/utils/message";
import { PureTableBar } from "@/components/RePureTableBar";
import { getOnlineList, forceLogout } from "@/api/online";

import Refresh from "~icons/ep/refresh";
import Delete from "~icons/ep/delete";
import Search from "~icons/ep/search";

defineOptions({
  name: "OnlineUser"
});

const loading = ref(false);
const dataList = ref([]);
const form = reactive({
  username: ""
});

const columns = [
  {
    label: "用户ID",
    prop: "user_id",
    minWidth: 80
  },
  {
    label: "用户名",
    prop: "username",
    minWidth: 120
  },
  {
    label: "姓名",
    prop: "real_name",
    minWidth: 100
  },
  {
    label: "登录IP",
    prop: "ip",
    minWidth: 130
  },
  {
    label: "浏览器",
    prop: "browser",
    minWidth: 100
  },
  {
    label: "登录时间",
    prop: "login_time",
    minWidth: 180
  },
  {
    label: "最后访问",
    prop: "last_access",
    minWidth: 180
  },
  {
    label: "操作",
    fixed: "right" as const,
    width: 100,
    slot: "operation"
  }
];

const onSearch = async () => {
  loading.value = true;
  try {
    const { code, data } = await getOnlineList({
      username: form.username || undefined
    });
    if (code === 0) {
      dataList.value = data.items;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.username = "";
  onSearch();
};

const handleForceLogout = async (row: any) => {
  try {
    const { code, message: msg } = await forceLogout(row.user_id);
    if (code === 0) {
      message("强制下线成功", { type: "success" });
      onSearch();
    } else {
      message(msg || "操作失败", { type: "error" });
    }
  } catch (error) {
    message(`操作异常 ${error}`, { type: "error" });
  }
};

onMounted(() => {
  onSearch();
});
</script>

<template>
  <div class="main">
    <el-form
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          clearable
          class="w-37.5!"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">
          <IconifyIconOffline :icon="Search" />
          搜索
        </el-button>
        <el-button @click="resetForm">
          <IconifyIconOffline :icon="Refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="在线用户" :columns="columns" @refresh="onSearch">
      <template v-slot="{ size, dynamicColumns }">
        <el-table
          v-loading="loading"
          :size="size"
          :data="dataList"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <el-table-column
            v-for="column in dynamicColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :width="column.width"
          >
            <template v-if="column.slot === 'operation'" #default="{ row }">
              <el-popconfirm
                title="确定要强制下线该用户吗？"
                @confirm="handleForceLogout(row)"
              >
                <template #reference>
                  <el-button type="danger" size="small" link>
                    <IconifyIconOffline :icon="Delete" />
                    强制下线
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
.main {
  padding: 20px;
}
</style>
