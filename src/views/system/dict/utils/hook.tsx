import { ref, reactive, onMounted, toRaw } from "vue";
import { message } from "@/utils/message";
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  createDictData,
  updateDictData,
  type DictTypeItem
} from "@/api/dict";
import type { PaginationProps } from "@pureadmin/table";
import { usePublicHooks } from "@/views/system/hooks";

export function useDict() {
  const loading = ref(false);
  const { tagStyle } = usePublicHooks();

  // 字典类型相关
  const typeForm = reactive({
    name: "",
    code: ""
  });
  const typeList = ref<DictTypeItem[]>([]);
  const typePagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 字典类型列定义
  const typeColumns: TableColumnList = [
    {
      label: "序号",
      prop: "id",
      minWidth: 80
    },
    {
      label: "字典名称",
      prop: "name",
      minWidth: 120
    },
    {
      label: "字典编码",
      prop: "code",
      minWidth: 150
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "禁用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "created_at",
      minWidth: 180
    },
    {
      label: "操作",
      fixed: "right",
      minWidth: 150,
      slot: "operation"
    }
  ];

  // 获取字典类型列表
  async function onSearchType() {
    loading.value = true;
    try {
      const { code, data } = await getDictTypeList({
        page: typePagination.currentPage,
        page_size: typePagination.pageSize,
        ...toRaw(typeForm)
      });
      if (code === 0) {
        typeList.value = data.items;
        typePagination.total = data.total;
      }
    } finally {
      loading.value = false;
    }
  }

  // 重置类型表单
  function resetTypeForm(formEl: any) {
    if (!formEl) return;
    formEl.resetFields();
    typePagination.currentPage = 1;
    onSearchType();
  }

  // 分页处理
  function handleTypeSizeChange(val: number) {
    typePagination.pageSize = val;
    onSearchType();
  }

  function handleTypeCurrentChange(val: number) {
    typePagination.currentPage = val;
    onSearchType();
  }

  onMounted(() => {
    onSearchType();
  });

  return {
    loading,
    typeForm,
    typeList,
    typeColumns,
    typePagination,
    onSearchType,
    resetTypeForm,
    handleTypeSizeChange,
    handleTypeCurrentChange
  };
}

// 字典类型表单弹窗
export function useDictTypeForm() {
  const formRef = ref();
  const formData = reactive({
    id: null as number | null,
    name: "",
    code: "",
    status: 1,
    remark: ""
  });
  const formRules = {
    name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
    code: [{ required: true, message: "请输入字典编码", trigger: "blur" }]
  };

  function openDialog(title: string, row?: any) {
    if (row) {
      formData.id = row.id;
      formData.name = row.name;
      formData.code = row.code;
      formData.status = row.status ?? 1;
      formData.remark = row.remark || "";
    } else {
      formData.id = null;
      formData.name = "";
      formData.code = "";
      formData.status = 1;
      formData.remark = "";
    }
  }

  async function submitForm() {
    if (!formRef.value) return false;
    await formRef.value.validate();

    if (formData.id) {
      await updateDictType(formData.id, {
        name: formData.name,
        code: formData.code,
        status: formData.status,
        remark: formData.remark
      });
      message("更新成功", { type: "success" });
    } else {
      await createDictType({
        name: formData.name,
        code: formData.code,
        status: formData.status,
        remark: formData.remark
      });
      message("创建成功", { type: "success" });
    }
    return true;
  }

  return {
    formRef,
    formData,
    formRules,
    openDialog,
    submitForm
  };
}

// 字典数据表单弹窗
export function useDictDataForm() {
  const formRef = ref();
  const formData = reactive({
    id: null as number | null,
    dict_type_id: null as number | null,
    label: "",
    value: "",
    sort: 0,
    status: 1,
    is_default: false
  });
  const formRules = {
    label: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
    value: [{ required: true, message: "请输入字典值", trigger: "blur" }]
  };

  function openDialog(dictTypeId: number, row?: any) {
    formData.dict_type_id = dictTypeId;
    if (row) {
      formData.id = row.id;
      formData.label = row.label;
      formData.value = row.value;
      formData.sort = row.sort;
      formData.status = row.status;
      formData.is_default = row.is_default;
    } else {
      formData.id = null;
      formData.label = "";
      formData.value = "";
      formData.sort = 0;
      formData.status = 1;
      formData.is_default = false;
    }
  }

  async function submitForm() {
    if (!formRef.value) return false;
    await formRef.value.validate();

    if (formData.id) {
      await updateDictData(formData.id, {
        label: formData.label,
        value: formData.value,
        sort: formData.sort,
        status: formData.status,
        is_default: formData.is_default
      });
      message("更新成功", { type: "success" });
    } else {
      await createDictData({
        dict_type_id: formData.dict_type_id!,
        label: formData.label,
        value: formData.value,
        sort: formData.sort,
        status: formData.status,
        is_default: formData.is_default
      });
      message("创建成功", { type: "success" });
    }
    return true;
  }

  return {
    formRef,
    formData,
    formRules,
    openDialog,
    submitForm
  };
}
