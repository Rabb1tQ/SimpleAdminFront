import dayjs from "dayjs";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import {
  getTenantList,
  getTenantDetail,
  createTenant,
  updateTenant,
  deleteTenant
} from "@/api/tenant";
import { reactive, ref, onMounted, h } from "vue";
import editForm from "../form.vue";

export function useTenant() {
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const switchStyle = ref(
    "--el-switch-on-color: var(--el-color-primary); --el-switch-off-color: var(--el-color-danger)"
  );
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "租户编号",
      prop: "id"
    },
    {
      label: "租户名称",
      prop: "name",
      minWidth: 120
    },
    {
      label: "租户编码",
      prop: "code",
      minWidth: 100
    },
    {
      label: "联系人",
      prop: "contact",
      minWidth: 100
    },
    {
      label: "联系电话",
      prop: "phone",
      minWidth: 120
    },
    {
      label: "邮箱",
      prop: "email",
      minWidth: 160
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={1}
          inactive-value={0}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 100
    },
    {
      label: "过期时间",
      prop: "expire_at",
      minWidth: 160,
      formatter: ({ expire_at }) =>
        expire_at ? dayjs(expire_at).format("YYYY-MM-DD HH:mm:ss") : "永久有效"
    },
    {
      label: "创建时间",
      prop: "created_at",
      minWidth: 160,
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

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        try {
          await updateTenant(row.id, { status: row.status });
          message(`已${row.status === 0 ? "停用" : "启用"}${row.name}`, {
            type: "success"
          });
        } catch {
          row.status === 0 ? (row.status = 1) : (row.status = 0);
          message("操作失败", { type: "error" });
        } finally {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
        }
      })
      .catch(() => {
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  async function handleDelete(row) {
    try {
      await deleteTenant(row.id);
      message(`已删除租户名称为${row.name}的这条数据`, { type: "success" });
      onSearch();
    } catch {
      message("删除失败", { type: "error" });
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

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getTenantList({
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        name: form.name || undefined,
        code: form.code || undefined,
        status: form.status !== "" ? Number(form.status) : undefined
      });
      dataList.value = data.items;
      pagination.total = data.total;
    } catch {
      message("获取租户列表失败", { type: "error" });
    } finally {
      loading.value = false;
    }
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  async function openDialog(title = "新增", row?: FormItemProps) {
    let formInline = {
      id: undefined,
      name: "",
      code: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      status: 1,
      expire_at: "",
      remark: ""
    };

    if (title === "修改" && row) {
      try {
        const { data } = await getTenantDetail(row.id);
        formInline = {
          id: data.id,
          name: data.name,
          code: data.code,
          contact: data.contact || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          status: data.status,
          expire_at: data.expire_at
            ? dayjs(data.expire_at).format("YYYY-MM-DD HH:mm:ss")
            : "",
          remark: data.remark || ""
        };
      } catch {
        message("获取租户详情失败", { type: "error" });
        return;
      }
    }

    addDialog({
      title: `${title}租户`,
      props: {
        formInline
      },
      width: "600px",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        FormRef.validate(async valid => {
          if (valid) {
            try {
              if (title === "新增") {
                await createTenant({
                  name: curData.name,
                  code: curData.code,
                  contact: curData.contact || undefined,
                  phone: curData.phone || undefined,
                  email: curData.email || undefined,
                  address: curData.address || undefined,
                  status: curData.status,
                  expire_at: curData.expire_at || undefined,
                  remark: curData.remark || undefined
                });
                message("创建成功", { type: "success" });
              } else {
                await updateTenant(curData.id, {
                  name: curData.name,
                  contact: curData.contact || undefined,
                  phone: curData.phone || undefined,
                  email: curData.email || undefined,
                  address: curData.address || undefined,
                  status: curData.status,
                  expire_at: curData.expire_at || undefined,
                  remark: curData.remark || undefined
                });
                message("更新成功", { type: "success" });
              }
              done();
              onSearch();
            } catch {
              message(title === "新增" ? "创建失败" : "更新失败", {
                type: "error"
              });
            }
          }
        });
      }
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
