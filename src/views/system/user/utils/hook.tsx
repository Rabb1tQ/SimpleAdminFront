import dayjs from "dayjs";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import type { FormItemProps } from "../utils/types";
import {
  getUserList,
  createUser,
  updateUser,
  deleteUser,
  resetPassword
} from "@/api/user";
import { getAllRoles } from "@/api/role";
import {
  ElForm,
  ElInput,
  ElFormItem,
  ElSelect,
  ElOption,
  ElMessageBox
} from "element-plus";
import { type Ref, ref, reactive, onMounted } from "vue";

// switch 样式
const switchStyle = ref(
  "--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
);

export function useUser(tableRef: Ref) {
  const form = reactive({
    username: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const selectedNum = ref(0);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const roleOptions = ref([]);

  const columns: TableColumnList = [
    {
      label: "勾选列",
      type: "selection",
      fixed: "left",
      reserveSelection: true
    },
    {
      label: "用户编号",
      prop: "id",
      width: 90
    },
    {
      label: "用户名称",
      prop: "username",
      minWidth: 130
    },
    {
      label: "真实姓名",
      prop: "real_name",
      minWidth: 130
    },
    {
      label: "邮箱",
      prop: "email",
      minWidth: 130
    },
    {
      label: "手机号码",
      prop: "phone",
      minWidth: 130
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 90,
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
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "创建时间",
      minWidth: 150,
      prop: "created_at",
      formatter: ({ created_at }) =>
        created_at ? dayjs(created_at).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];

  async function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 0 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.username
      }</strong>用户吗?`,
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
          { loading: true }
        );
        const { code, message: msg } = await updateUser(row.id, {
          status: row.status
        });
        if (code === 0) {
          message("已成功修改用户状态", { type: "success" });
        } else {
          // 操作失败，恢复状态
          row.status === 0 ? (row.status = 1) : (row.status = 0);
          message(msg || "操作失败", { type: "error" });
        }
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          { loading: false }
        );
      })
      .catch(() => {
        // 取消操作，恢复状态
        row.status === 0 ? (row.status = 1) : (row.status = 0);
      });
  }

  async function handleDelete(row) {
    const { code } = await deleteUser(row.id);
    if (code === 0) {
      message(`已成功删除用户 ${row.username}`, { type: "success" });
      onSearch();
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
    selectedNum.value = val.length;
    tableRef.value.setAdaptive();
  }

  function onSelectionCancel() {
    selectedNum.value = 0;
    tableRef.value.getTableRef().clearSelection();
  }

  async function onSearch() {
    loading.value = true;
    const params = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      username: form.username || undefined,
      status: form.status !== "" ? Number(form.status) : undefined
    };
    const { code, data } = await getUserList(params);
    if (code === 0) {
      dataList.value = data.items;
      pagination.total = data.total;
    }
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  async function openDialog(title = "新增", row?: FormItemProps) {
    // 获取角色列表
    const { data: roles } = await getAllRoles();
    roleOptions.value = (roles || []).map(item => ({
      value: item.id,
      label: item.name
    }));

    // 获取用户当前角色
    const currentRoleIds: number[] = row?.role_ids || [];

    const formData = reactive({
      username: row?.username ?? "",
      real_name: row?.real_name ?? "",
      password: "",
      email: row?.email ?? "",
      phone: row?.phone ?? "",
      status: row?.status ?? 1,
      role_ids: currentRoleIds
    });

    addDialog({
      title: `${title}用户`,
      props: { formInline: formData },
      width: "500px",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <ElForm ref={formRef} model={formData} label-width="100px">
          <ElFormItem
            label="用户名称"
            prop="username"
            rules={[
              { required: true, message: "请输入用户名称", trigger: "blur" }
            ]}
          >
            <ElInput
              v-model={formData.username}
              placeholder="请输入用户名称"
              disabled={title === "修改"}
              clearable
            />
          </ElFormItem>
          <ElFormItem
            label="真实姓名"
            prop="real_name"
            rules={[
              { required: true, message: "请输入真实姓名", trigger: "blur" }
            ]}
          >
            <ElInput
              v-model={formData.real_name}
              placeholder="请输入真实姓名"
              clearable
            />
          </ElFormItem>
          {title === "新增" && (
            <ElFormItem
              label="密码"
              prop="password"
              rules={[
                { required: true, message: "请输入密码", trigger: "blur" }
              ]}
            >
              <ElInput
                v-model={formData.password}
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
              />
            </ElFormItem>
          )}
          <ElFormItem label="邮箱" prop="email">
            <ElInput
              v-model={formData.email}
              placeholder="请输入邮箱"
              clearable
            />
          </ElFormItem>
          <ElFormItem label="手机号" prop="phone">
            <ElInput
              v-model={formData.phone}
              placeholder="请输入手机号"
              clearable
            />
          </ElFormItem>
          <ElFormItem label="角色" prop="role_ids">
            <ElSelect
              v-model={formData.role_ids}
              multiple
              placeholder="请选择角色"
              class="w-full"
            >
              {roleOptions.value.map(item => (
                <ElOption
                  key={item.value}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <el-switch
              v-model={formData.status}
              active-value={1}
              inactive-value={0}
              active-text="启用"
              inactive-text="停用"
              inline-prompt
              style={switchStyle.value}
            />
          </ElFormItem>
        </ElForm>
      ),
      beforeSure: async done => {
        const FormRef = formRef.value;
        FormRef.validate(async (valid: boolean) => {
          if (valid) {
            if (title === "新增") {
              const { code, message: msg } = await createUser({
                username: formData.username,
                password: formData.password,
                real_name: formData.real_name,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                role_ids: formData.role_ids
              });
              if (code === 0) {
                message(`新增用户 ${formData.username} 成功`, {
                  type: "success"
                });
                done();
                onSearch();
              } else {
                message(msg || "创建失败", { type: "error" });
              }
            } else {
              const { code, message: msg } = await updateUser(row.id, {
                real_name: formData.real_name,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
                role_ids: formData.role_ids
              });
              if (code === 0) {
                message(`修改用户 ${formData.username} 成功`, {
                  type: "success"
                });
                done();
                onSearch();
              } else {
                message(msg || "修改失败", { type: "error" });
              }
            }
          }
        });
      }
    });
  }

  /** 重置密码 */
  function handleReset(row) {
    const pwdForm = reactive({ newPwd: "" });
    const ruleFormRef = ref();

    addDialog({
      title: `重置 ${row.username} 用户的密码`,
      width: "400px",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => (
        <ElForm ref={ruleFormRef} model={pwdForm}>
          <ElFormItem
            prop="newPwd"
            rules={[
              { required: true, message: "请输入新密码", trigger: "blur" }
            ]}
          >
            <ElInput
              v-model={pwdForm.newPwd}
              type="password"
              placeholder="请输入新密码"
              show-password
              clearable
            />
          </ElFormItem>
        </ElForm>
      ),
      beforeSure: async done => {
        ruleFormRef.value.validate(async (valid: boolean) => {
          if (valid) {
            const { code } = await resetPassword(row.id, pwdForm.newPwd);
            if (code === 0) {
              message(`已成功重置 ${row.username} 的密码`, { type: "success" });
              done();
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
    selectedNum,
    pagination,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleReset,
    handleSizeChange,
    onSelectionCancel,
    handleCurrentChange,
    handleSelectionChange
  };
}
