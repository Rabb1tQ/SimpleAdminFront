import dayjs from "dayjs";
import { message } from "@/utils/message";
import { getKeyList } from "@pureadmin/utils";
import {
  getOperationLogList,
  exportOperationLog,
  getOperationLogDetail
} from "@/api/log";
import { usePublicHooks } from "@/views/system/hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { type Ref, reactive, ref, onMounted } from "vue";

export function useLog(tableRef: Ref) {
  const form = reactive({
    module: "",
    status: null as number | null,
    username: ""
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
      label: "操作人员",
      prop: "username",
      minWidth: 100
    },
    {
      label: "操作模块",
      prop: "module",
      minWidth: 140
    },
    {
      label: "操作动作",
      prop: "action",
      minWidth: 140
    },
    {
      label: "请求方法",
      prop: "method",
      minWidth: 80
    },
    {
      label: "操作 IP",
      prop: "ip",
      minWidth: 120
    },
    {
      label: "执行时长",
      prop: "duration",
      minWidth: 100,
      formatter: ({ duration }) => `${duration}ms`
    },
    {
      label: "操作状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "成功" : "失败"}
        </el-tag>
      )
    },
    {
      label: "操作时间",
      prop: "created_at",
      minWidth: 180,
      formatter: ({ created_at }) =>
        dayjs(created_at).format("YYYY-MM-DD HH:mm:ss")
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
      if (form.module) {
        params.module = form.module;
      }
      if (form.status !== null) {
        params.status = form.status;
      }
      const { code, data } = await getOperationLogList(params);
      if (code === 0) {
        dataList.value = data.items;
        pagination.total = data.total;
      }
    } catch (error) {
      console.error("获取操作日志失败:", error);
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
      if (form.module) {
        params.module = form.module;
      }
      if (form.status !== null) {
        params.status = form.status;
      }
      const blob = await exportOperationLog(params);
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `operation_log_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message("导出成功", { type: "success" });
    } catch (error) {
      console.error("导出操作日志失败:", error);
      message("导出失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  // 查看日志详情
  async function handleDetail(row: any) {
    const { code, data } = await getOperationLogDetail(row.id);
    if (code === 0) {
      addDialog({
        title: "日志详情",
        width: "700px",
        draggable: true,
        closeOnClickModal: false,
        contentRenderer: () => (
          <div class="log-detail-container">
            <style>
              {`
                .log-detail-container {
                  max-height: 60vh;
                  overflow: auto;
                  box-sizing: border-box;
                }
                .log-detail-container .el-descriptions__table {
                  table-layout: fixed;
                  width: 100%;
                }
                .log-detail-container .el-descriptions__cell {
                  word-break: break-all;
                }
                .log-detail-container .el-textarea__inner {
                  word-break: break-all;
                }
              `}
            </style>
            <el-descriptions column={2} border size="small">
              <el-descriptions-item label="日志ID" span={2}>
                {data.id}
              </el-descriptions-item>
              <el-descriptions-item label="操作人员">
                {data.username}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {data.user_id}
              </el-descriptions-item>
              <el-descriptions-item label="操作模块">
                {data.module}
              </el-descriptions-item>
              <el-descriptions-item label="操作动作">
                {data.action}
              </el-descriptions-item>
              <el-descriptions-item label="请求方法">
                <el-tag
                  type={
                    data.method === "GET"
                      ? "success"
                      : data.method === "POST"
                        ? "primary"
                        : data.method === "PUT"
                          ? "warning"
                          : "danger"
                  }
                >
                  {data.method}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="执行时长">
                {data.duration}ms
              </el-descriptions-item>
              <el-descriptions-item label="请求URL" span={2}>
                <el-text class="w-full" truncated>
                  {data.url}
                </el-text>
              </el-descriptions-item>
              <el-descriptions-item label="操作IP">
                {data.ip}
              </el-descriptions-item>
              <el-descriptions-item label="操作状态">
                <el-tag type={data.status === 1 ? "success" : "danger"}>
                  {data.status === 1 ? "成功" : "失败"}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="操作时间" span={2}>
                {dayjs(data.created_at).format("YYYY-MM-DD HH:mm:ss")}
              </el-descriptions-item>
              <el-descriptions-item label="浏览器代理" span={2}>
                <div style="word-break: break-all; white-space: normal;">
                  {data.user_agent || "-"}
                </div>
              </el-descriptions-item>
              {data.request_data && (
                <el-descriptions-item label="请求参数" span={2}>
                  <el-input
                    type="textarea"
                    autosize={{ minRows: 2, maxRows: 6 }}
                    modelValue={
                      typeof data.request_data === "string"
                        ? data.request_data
                        : JSON.stringify(data.request_data, null, 2)
                    }
                    readonly
                    style="width: 100%;"
                  />
                </el-descriptions-item>
              )}
              {data.response_data && (
                <el-descriptions-item label="响应结果" span={2}>
                  <el-input
                    type="textarea"
                    autosize={{ minRows: 2, maxRows: 6 }}
                    modelValue={
                      typeof data.response_data === "string"
                        ? data.response_data
                        : JSON.stringify(data.response_data, null, 2)
                    }
                    readonly
                    style="width: 100%;"
                  />
                </el-descriptions-item>
              )}
              {data.error_msg && (
                <el-descriptions-item label="错误信息" span={2}>
                  <el-text type="danger">{data.error_msg}</el-text>
                </el-descriptions-item>
              )}
            </el-descriptions>
          </div>
        ),
        hideFooter: true
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
