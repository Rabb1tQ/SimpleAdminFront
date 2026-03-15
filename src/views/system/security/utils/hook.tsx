import { ref, reactive, onMounted, h } from "vue";
import { ElMessage, ElMessageBox, ElTag } from "element-plus";
import type { PaginationProps } from "@pureadmin/table";
import {
  getSecurityConfig,
  updateSecurityConfig,
  getIpRuleList,
  createIpRule,
  deleteIpRule,
  updateIpRuleStatus,
  getLockedUsers,
  unlockUser
} from "@/api/security";
import type {
  SecurityConfigItem,
  IpRuleItem,
  LockedUserItem,
  LoginForm,
  IpRuleForm
} from "./types";

export function useSecurity() {
  // 当前活动的标签页
  const activeTab = ref("login");

  // ==================== 登录安全配置 ====================
  const loginForm = reactive<LoginForm>({
    login_fail_threshold: 5,
    lock_duration: 30
  });
  const loginLoading = ref(false);

  async function loadLoginConfig() {
    loginLoading.value = true;
    try {
      const { data } = await getSecurityConfig("login");
      if (data) {
        data.forEach((item: SecurityConfigItem) => {
          if (item.config_key === "login_fail_threshold") {
            loginForm.login_fail_threshold = parseInt(item.config_value) || 5;
          } else if (item.config_key === "lock_duration") {
            loginForm.lock_duration = parseInt(item.config_value) || 30;
          }
        });
      }
    } catch (error) {
      console.error("加载登录配置失败:", error);
    } finally {
      loginLoading.value = false;
    }
  }

  async function saveLoginConfig() {
    loginLoading.value = true;
    try {
      await updateSecurityConfig({
        configs: [
          {
            config_key: "login_fail_threshold",
            config_value: String(loginForm.login_fail_threshold)
          },
          {
            config_key: "lock_duration",
            config_value: String(loginForm.lock_duration)
          }
        ]
      });
      ElMessage.success("保存成功");
    } catch {
      ElMessage.error("保存失败");
    } finally {
      loginLoading.value = false;
    }
  }

  // ==================== IP规则管理 ====================
  const ipRuleLoading = ref(false);
  const ipRuleList = ref<IpRuleItem[]>([]);
  const ipRulePagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const ipRuleSearch = reactive({
    rule_type: "",
    ip_address: ""
  });

  // IP规则表格列
  const ipRuleColumns = [
    {
      label: "IP地址",
      prop: "ip_address",
      minWidth: 150
    },
    {
      label: "规则类型",
      prop: "rule_type",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        return h(
          ElTag,
          { type: row.rule_type === "WHITELIST" ? "success" : "danger" },
          () => (row.rule_type === "WHITELIST" ? "白名单" : "黑名单")
        );
      }
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row }) => {
        return h(ElTag, { type: row.status === 1 ? "success" : "info" }, () =>
          row.status === 1 ? "启用" : "禁用"
        );
      }
    },
    {
      label: "备注",
      prop: "description",
      minWidth: 200
    },
    {
      label: "创建时间",
      prop: "created_at",
      minWidth: 180
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  async function loadIpRuleList() {
    ipRuleLoading.value = true;
    try {
      const { data } = await getIpRuleList({
        page: ipRulePagination.currentPage,
        page_size: ipRulePagination.pageSize,
        ...ipRuleSearch
      });
      ipRuleList.value = data.list || [];
      ipRulePagination.total = data.total || 0;
    } catch (error) {
      console.error("加载IP规则失败:", error);
    } finally {
      ipRuleLoading.value = false;
    }
  }

  function onIpRuleSearch() {
    ipRulePagination.currentPage = 1;
    loadIpRuleList();
  }

  function resetIpRuleSearch() {
    ipRuleSearch.rule_type = "";
    ipRuleSearch.ip_address = "";
    onIpRuleSearch();
  }

  // 添加IP规则对话框
  const ipRuleDialogVisible = ref(false);
  const ipRuleFormRef = ref();
  const ipRuleForm = reactive<IpRuleForm>({
    ip_address: "",
    rule_type: "WHITELIST",
    description: ""
  });
  const ipRuleRules = {
    ip_address: [{ required: true, message: "请输入IP地址", trigger: "blur" }],
    rule_type: [
      { required: true, message: "请选择规则类型", trigger: "change" }
    ]
  };

  function openIpRuleDialog() {
    ipRuleForm.ip_address = "";
    ipRuleForm.rule_type = "WHITELIST";
    ipRuleForm.description = "";
    ipRuleDialogVisible.value = true;
  }

  async function submitIpRule() {
    const valid = await ipRuleFormRef.value?.validate();
    if (!valid) return;

    try {
      await createIpRule(ipRuleForm);
      ElMessage.success("添加成功");
      ipRuleDialogVisible.value = false;
      loadIpRuleList();
    } catch {
      ElMessage.error("添加失败");
    }
  }

  async function handleDeleteIpRule(row: IpRuleItem) {
    await ElMessageBox.confirm(
      `确定要删除IP规则【${row.ip_address}】吗？`,
      "提示",
      {
        type: "warning"
      }
    );
    try {
      await deleteIpRule(row.id);
      ElMessage.success("删除成功");
      loadIpRuleList();
    } catch {
      ElMessage.error("删除失败");
    }
  }

  async function handleToggleIpRuleStatus(row: IpRuleItem) {
    const newStatus = row.status === 1 ? 0 : 1;
    try {
      await updateIpRuleStatus(row.id, newStatus);
      ElMessage.success("状态更新成功");
      loadIpRuleList();
    } catch {
      ElMessage.error("状态更新失败");
    }
  }

  // ==================== 锁定用户管理 ====================
  const lockedUserLoading = ref(false);
  const lockedUserList = ref<LockedUserItem[]>([]);
  const lockedUserPagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const lockedUserSearch = reactive({
    username: ""
  });

  // 锁定用户表格列
  const lockedUserColumns = [
    {
      label: "用户名",
      prop: "username",
      minWidth: 120
    },
    {
      label: "姓名",
      prop: "real_name",
      minWidth: 120
    },
    {
      label: "失败次数",
      prop: "fail_count",
      minWidth: 100
    },
    {
      label: "锁定时间",
      prop: "locked_at",
      minWidth: 180
    },
    {
      label: "锁定时长(分钟)",
      prop: "lock_duration",
      minWidth: 120
    },
    {
      label: "操作",
      fixed: "right",
      width: 100,
      slot: "operation"
    }
  ];

  async function loadLockedUsers() {
    lockedUserLoading.value = true;
    try {
      const { data } = await getLockedUsers({
        page: lockedUserPagination.currentPage,
        page_size: lockedUserPagination.pageSize,
        ...lockedUserSearch
      });
      lockedUserList.value = data.list || [];
      lockedUserPagination.total = data.total || 0;
    } catch (error) {
      console.error("加载锁定用户失败:", error);
    } finally {
      lockedUserLoading.value = false;
    }
  }

  function onLockedUserSearch() {
    lockedUserPagination.currentPage = 1;
    loadLockedUsers();
  }

  function resetLockedUserSearch() {
    lockedUserSearch.username = "";
    onLockedUserSearch();
  }

  async function handleUnlockUser(row: LockedUserItem) {
    await ElMessageBox.confirm(
      `确定要解锁用户【${row.username}】吗？`,
      "提示",
      {
        type: "warning"
      }
    );
    try {
      await unlockUser(row.user_id);
      ElMessage.success("解锁成功");
      loadLockedUsers();
    } catch {
      ElMessage.error("解锁失败");
    }
  }

  // 初始化
  onMounted(() => {
    loadLoginConfig();
    loadIpRuleList();
    loadLockedUsers();
  });

  return {
    activeTab,
    // 登录配置
    loginForm,
    loginLoading,
    saveLoginConfig,
    // IP规则
    ipRuleLoading,
    ipRuleList,
    ipRulePagination,
    ipRuleSearch,
    ipRuleColumns,
    onIpRuleSearch,
    resetIpRuleSearch,
    loadIpRuleList,
    ipRuleDialogVisible,
    ipRuleFormRef,
    ipRuleForm,
    ipRuleRules,
    openIpRuleDialog,
    submitIpRule,
    handleDeleteIpRule,
    handleToggleIpRuleStatus,
    // 锁定用户
    lockedUserLoading,
    lockedUserList,
    lockedUserPagination,
    lockedUserSearch,
    lockedUserColumns,
    onLockedUserSearch,
    resetLockedUserSearch,
    loadLockedUsers,
    handleUnlockUser
  };
}
