import dayjs from "dayjs";
import { message } from "@/utils/message";
import { getKeyList } from "@pureadmin/utils";
import { getLoginLogList, exportLoginLog, getLoginLogDetail } from "@/api/log";
import { usePublicHooks } from "@/views/system/hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { type Ref, reactive, ref, onMounted } from "vue";

export function useLoginLog(tableRef: Ref) {
  const form = reactive({
    username: "",
    status: null as number | null
  });
  const dataList = ref([]);
  const loading = ref(true);
  const selectedNum = ref(0);
  const { tagStyle } = usePublicHooks();

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "勾选列",
      type: "selection",
      fixed: "left",
      reserveSelection: true
    },
    {
      label: "序号",
      prop: "id",
      minWidth: 90
    },
    {
      label: "用户名",
      prop: "username",
      minWidth: 100
    },
    {
      label: "登录 IP",
      prop: "ip",
      minWidth: 140
    },
    {
      label: "登录地点",
      prop: "location",
      minWidth: 140
    },
    {
      label: "操作系统",
      prop: "os",
      minWidth: 100
    },
    {
      label: "浏览器类型",
      prop: "browser",
      minWidth: 100
    },
    {
      label: "登录状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "成功" : "失败"}
        </el-tag>
      )
    },
    {
      label: "提示消息",
      prop: "msg",
      minWidth: 100
    },
    {
      label: "登录时间",
      prop: "login_time",
      minWidth: 180,
      formatter: ({ login_time }) =>
        dayjs(login_time).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 100,
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    tableRef.value.setAdaptive();
  }

  function onSelectionCancel() {
    selectedNum.value = 0;
    tableRef.value.getTableRef().clearSelection();
  }

  function onbatchDel() {
    const curSelected = tableRef.value.getTableRef().getSelectionRows();
    message(`已删除序号为 ${getKeyList(curSelected, "id")} 的数据`, {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const params: any = {
        page: pagination.currentPage,
        page_size: pagination.pageSize
      };
      if (form.username) {
        params.username = form.username;
      }
      if (form.status !== null) {
        params.status = form.status;
      }
      const { code, data } = await getLoginLogList(params);
      if (code === 0) {
        dataList.value = data.items;
        pagination.total = data.total;
      }
    } catch (error) {
      console.error("获取登录日志失败:", error);
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    onSearch();
  };

  onMounted(() => {
    onSearch();
  });

  // 导出日志
  async function handleExport() {
    loading.value = true;
    try {
      const params: any = {};
      if (form.username) {
        params.username = form.username;
      }
      if (form.status !== null) {
        params.status = form.status;
      }
      const blob = await exportLoginLog(params);
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `login_log_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message("导出成功", { type: "success" });
    } catch (error) {
      console.error("导出登录日志失败:", error);
      message("导出失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  // 查看登录日志详情
  async function handleDetail(row: any) {
    const { code, data } = await getLoginLogDetail(row.id);
    if (code === 0) {
      addDialog({
        title: "登录日志详情",
        width: "600px",
        draggable: true,
        closeOnClickModal: false,
        hideFooter: true,
        contentRenderer: () => (
          <el-descriptions column={2} border>
            <el-descriptions-item label="日志ID" span={2}>
              {data.id}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">
              {data.username}
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">
              {data.user_id || "-"}
            </el-descriptions-item>
            <el-descriptions-item label="登录IP">
              {data.ip}
            </el-descriptions-item>
            <el-descriptions-item label="登录地点">
              {data.location || "-"}
            </el-descriptions-item>
            <el-descriptions-item label="操作系统">
              {data.os || "-"}
            </el-descriptions-item>
            <el-descriptions-item label="浏览器">
              {data.browser || "-"}
            </el-descriptions-item>
            <el-descriptions-item label="登录状态">
              <el-tag type={data.status === 1 ? "success" : "danger"}>
                {data.status === 1 ? "成功" : "失败"}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提示消息">
              {data.msg || "-"}
            </el-descriptions-item>
            <el-descriptions-item label="登录时间" span={2}>
              {dayjs(data.login_time).format("YYYY-MM-DD HH:mm:ss")}
            </el-descriptions-item>
          </el-descriptions>
        )
      });
    }
  }

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    selectedNum,
    onSearch,
    resetForm,
    onbatchDel,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange,
    handleExport,
    handleDetail
  };
}
