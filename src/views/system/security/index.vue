<script setup lang="ts">
import { useSecurity } from "./utils/hook";

const {
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
} = useSecurity();
</script>

<template>
  <div class="main">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 登录安全配置 -->
      <el-tab-pane label="登录安全" name="login">
        <el-card shadow="never">
          <template #header>
            <span>登录失败锁定配置</span>
          </template>
          <el-form
            v-loading="loginLoading"
            :model="loginForm"
            label-width="180px"
          >
            <el-form-item label="登录失败锁定阈值">
              <el-input-number
                v-model="loginForm.login_fail_threshold"
                :min="1"
                :max="10"
                :step="1"
              />
              <span class="ml-2 text-gray-500">次</span>
            </el-form-item>
            <el-form-item label="锁定时长">
              <el-input-number
                v-model="loginForm.lock_duration"
                :min="5"
                :max="1440"
                :step="5"
              />
              <span class="ml-2 text-gray-500">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loginLoading"
                @click="saveLoginConfig"
              >
                保存配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- IP规则管理 -->
      <el-tab-pane label="IP规则" name="ip-rule">
        <div class="mb-4">
          <el-form :inline="true" class="search-form">
            <el-form-item label="IP地址">
              <el-input
                v-model="ipRuleSearch.ip_address"
                placeholder="请输入IP地址"
                clearable
                @keyup.enter="onIpRuleSearch"
              />
            </el-form-item>
            <el-form-item label="规则类型">
              <el-select
                v-model="ipRuleSearch.rule_type"
                placeholder="全部"
                clearable
              >
                <el-option label="白名单" value="WHITELIST" />
                <el-option label="黑名单" value="BLACKLIST" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onIpRuleSearch">搜索</el-button>
              <el-button @click="resetIpRuleSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <pure-table
          :data="ipRuleList"
          :columns="ipRuleColumns"
          :loading="ipRuleLoading"
          :pagination="ipRulePagination"
          @page-current-change="
            page => {
              ipRulePagination.currentPage = page;
              loadIpRuleList();
            }
          "
          @page-size-change="
            size => {
              ipRulePagination.pageSize = size;
              loadIpRuleList();
            }
          "
        >
          <template #operation="{ row }">
            <el-button
              type="primary"
              link
              @click="handleToggleIpRuleStatus(row)"
            >
              {{ row.status === 1 ? "禁用" : "启用" }}
            </el-button>
            <el-popconfirm
              :title="`确定要删除IP规则【${row.ip_address}】吗？`"
              @confirm="handleDeleteIpRule(row)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>

        <div class="mt-4">
          <el-button type="primary" @click="openIpRuleDialog"
            >添加IP规则</el-button
          >
        </div>
      </el-tab-pane>

      <!-- 锁定用户管理 -->
      <el-tab-pane label="锁定用户" name="locked-users">
        <div class="mb-4">
          <el-form :inline="true" class="search-form">
            <el-form-item label="用户名">
              <el-input
                v-model="lockedUserSearch.username"
                placeholder="请输入用户名"
                clearable
                @keyup.enter="onLockedUserSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onLockedUserSearch"
                >搜索</el-button
              >
              <el-button @click="resetLockedUserSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <pure-table
          :data="lockedUserList"
          :columns="lockedUserColumns"
          :loading="lockedUserLoading"
          :pagination="lockedUserPagination"
          @page-current-change="
            page => {
              lockedUserPagination.currentPage = page;
              loadLockedUsers();
            }
          "
          @page-size-change="
            size => {
              lockedUserPagination.pageSize = size;
              loadLockedUsers();
            }
          "
        >
          <template #operation="{ row }">
            <el-popconfirm
              :title="`确定要解锁用户【${row.username}】吗？`"
              @confirm="handleUnlockUser(row)"
            >
              <template #reference>
                <el-button type="primary" link>解锁</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加IP规则对话框 -->
    <el-dialog v-model="ipRuleDialogVisible" title="添加IP规则" width="500px">
      <el-form
        ref="ipRuleFormRef"
        :model="ipRuleForm"
        :rules="ipRuleRules"
        label-width="100px"
      >
        <el-form-item label="IP地址" prop="ip_address">
          <el-input
            v-model="ipRuleForm.ip_address"
            placeholder="请输入IP地址，如：192.168.1.1 或 192.168.1.0/24"
          />
        </el-form-item>
        <el-form-item label="规则类型" prop="rule_type">
          <el-radio-group v-model="ipRuleForm.rule_type">
            <el-radio value="WHITELIST">白名单</el-radio>
            <el-radio value="BLACKLIST">黑名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="ipRuleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ipRuleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitIpRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.main {
  padding: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ml-2 {
  margin-left: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.text-gray-500 {
  color: #909399;
}
</style>
