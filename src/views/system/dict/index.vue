<script setup lang="ts">
import { ref } from "vue";
import { useDict, useDictTypeForm, useDictDataForm } from "./utils/hook";
import { deleteDictType, deleteDictData, getDictDataList } from "@/api/dict";
import { message } from "@/utils/message";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";

defineOptions({
  name: "Dict"
});

const formRef = ref();
const tableRef = ref();

const {
  loading,
  typeForm,
  typeList,
  typeColumns,
  typePagination,
  onSearchType,
  resetTypeForm,
  handleTypeSizeChange,
  handleTypeCurrentChange
} = useDict();

const {
  formRef: dictTypeFormRef,
  formData: dictTypeFormData,
  formRules: dictTypeFormRules,
  openDialog: openTypeDialog,
  submitForm: submitTypeForm
} = useDictTypeForm();

const {
  formRef: dictDataFormRef,
  formData: dictDataFormData,
  formRules: dictDataFormRules,
  openDialog: openDataDialog,
  submitForm: submitDataForm
} = useDictDataForm();

// 字典类型弹窗
const typeDialogVisible = ref(false);
const typeDialogTitle = ref("");

// 字典数据列表（在弹窗中显示）
const dialogDataList = ref([]);
const dialogDataLoading = ref(false);
const dialogDataPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 字典数据弹窗
const dataDialogVisible = ref(false);
const dataDialogTitle = ref("");
const currentDictTypeId = ref<number | null>(null);

function handleAddType() {
  typeDialogTitle.value = "新增字典类型";
  openTypeDialog("新增");
  currentDictTypeId.value = null;
  dialogDataList.value = [];
  typeDialogVisible.value = true;
}

async function handleEditType(row: any) {
  typeDialogTitle.value = "编辑字典类型";
  openTypeDialog("编辑", row);
  currentDictTypeId.value = row.id;
  typeDialogVisible.value = true;
  // 加载该类型的字典数据
  await loadDictData(row.id);
}

async function loadDictData(dictTypeId: number, page = 1) {
  dialogDataLoading.value = true;
  try {
    const { code, data } = await getDictDataList({
      page,
      page_size: dialogDataPagination.value.pageSize,
      dict_type_id: dictTypeId
    });
    if (code === 0) {
      dialogDataList.value = data.items;
      dialogDataPagination.value.total = data.total;
      dialogDataPagination.value.currentPage = page;
    }
  } finally {
    dialogDataLoading.value = false;
  }
}

async function handleDeleteType(row: any) {
  await deleteDictType(row.id);
  message("删除成功", { type: "success" });
  onSearchType();
}

async function handleTypeSubmit() {
  const success = await submitTypeForm();
  if (success) {
    typeDialogVisible.value = false;
    onSearchType();
  }
}

// 字典数据操作
function handleAddData() {
  if (!currentDictTypeId.value) {
    message("请先保存字典类型", { type: "warning" });
    return;
  }
  dataDialogTitle.value = "新增字典数据";
  openDataDialog(currentDictTypeId.value);
  dataDialogVisible.value = true;
}

function handleEditData(row: any) {
  dataDialogTitle.value = "编辑字典数据";
  openDataDialog(currentDictTypeId.value!, row);
  dataDialogVisible.value = true;
}

async function handleDeleteData(row: any) {
  await deleteDictData(row.id);
  message("删除成功", { type: "success" });
  if (currentDictTypeId.value) {
    await loadDictData(
      currentDictTypeId.value,
      dialogDataPagination.value.currentPage
    );
  }
}

async function handleDataSubmit() {
  const success = await submitDataForm();
  if (success) {
    dataDialogVisible.value = false;
    if (currentDictTypeId.value) {
      await loadDictData(
        currentDictTypeId.value,
        dialogDataPagination.value.currentPage
      );
    }
  }
}

// 分页
async function handleDialogDataPageChange(page: number) {
  if (currentDictTypeId.value) {
    await loadDictData(currentDictTypeId.value, page);
  }
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="typeForm"
      class="search-form bg-bg_color w-full pl-8 pt-3 overflow-auto"
    >
      <el-form-item label="字典名称" prop="name">
        <el-input
          v-model="typeForm.name"
          placeholder="请输入字典名称"
          clearable
          class="w-37.5!"
        />
      </el-form-item>
      <el-form-item label="字典编码" prop="code">
        <el-input
          v-model="typeForm.code"
          placeholder="请输入字典编码"
          clearable
          class="w-37.5!"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri:search-line')"
          :loading="loading"
          @click="onSearchType"
        >
          搜索
        </el-button>
        <el-button
          :icon="useRenderIcon(Refresh)"
          @click="resetTypeForm(formRef)"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      title="字典类型"
      :columns="typeColumns"
      @refresh="onSearchType"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAddType"
        >
          新增
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          row-key="id"
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="typeList"
          :columns="dynamicColumns"
          :pagination="{ ...typePagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @page-size-change="handleTypeSizeChange"
          @page-current-change="handleTypeCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              type="primary"
              text
              size="small"
              @click="handleEditType(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="是否确认删除?"
              @confirm="handleDeleteType(row)"
            >
              <template #reference>
                <el-button type="danger" text size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 字典类型编辑弹窗（包含字典数据管理） -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogTitle"
      width="900px"
      destroy-on-close
    >
      <el-form
        ref="dictTypeFormRef"
        :model="dictTypeFormData"
        :rules="dictTypeFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="字典名称" prop="name">
              <el-input
                v-model="dictTypeFormData.name"
                placeholder="请输入字典名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="字典编码" prop="code">
              <el-input
                v-model="dictTypeFormData.code"
                placeholder="请输入字典编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="dictTypeFormData.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="dictTypeFormData.remark"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 字典数据管理 -->
      <el-divider content-position="left">
        <span class="text-gray-500">字典数据</span>
      </el-divider>

      <div class="mb-4">
        <el-button
          type="primary"
          size="small"
          :icon="useRenderIcon(AddFill)"
          :disabled="!currentDictTypeId"
          @click="handleAddData"
        >
          新增数据
        </el-button>
        <span v-if="!currentDictTypeId" class="ml-2 text-gray-400 text-sm">
          （保存字典类型后可添加数据）
        </span>
      </div>

      <el-table
        :data="dialogDataList"
        v-loading="dialogDataLoading"
        border
        size="small"
        max-height="300"
        :resizable="false"
        style="width: 100%"
      >
        <el-table-column prop="label" label="标签" min-width="120" />
        <el-table-column prop="value" label="值" min-width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 1 ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button
              type="primary"
              text
              size="small"
              @click="handleEditData(row)"
            >
              编辑
            </el-button>
            <el-popconfirm title="确认删除?" @confirm="handleDeleteData(row)">
              <template #reference>
                <el-button type="danger" text size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div
        class="mt-3 flex justify-end"
        v-if="dialogDataPagination.total > dialogDataPagination.pageSize"
      >
        <el-pagination
          small
          background
          layout="prev, pager, next"
          :total="dialogDataPagination.total"
          :page-size="dialogDataPagination.pageSize"
          :current-page="dialogDataPagination.currentPage"
          @current-change="handleDialogDataPageChange"
        />
      </div>

      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTypeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字典数据编辑弹窗 -->
    <el-dialog
      v-model="dataDialogVisible"
      :title="dataDialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="dictDataFormRef"
        :model="dictDataFormData"
        :rules="dictDataFormRules"
        label-width="100px"
      >
        <el-form-item label="字典标签" prop="label">
          <el-input
            v-model="dictDataFormData.label"
            placeholder="请输入字典标签"
          />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input
            v-model="dictDataFormData.value"
            placeholder="请输入字典值"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="dictDataFormData.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dictDataFormData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否默认" prop="is_default">
          <el-switch v-model="dictDataFormData.is_default" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDataSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.main {
  margin: 20px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
