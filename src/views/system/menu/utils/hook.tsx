import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps, MenuItem } from "./types";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { cloneDeep, isAllEmpty, deviceDetection } from "@pureadmin/utils";
import {
  getMenuList,
  createMenu,
  updateMenu,
  deleteMenu,
  type MenuCreate,
  type MenuUpdate
} from "@/api/menu";

export function useMenu() {
  const form = reactive({
    title: ""
  });

  const formRef = ref();
  const dataList = ref<MenuItem[]>([]);
  const loading = ref(true);

  const getMenuType = (type: number, text = false) => {
    switch (type) {
      case 1:
        return text ? "目录" : "primary";
      case 2:
        return text ? "菜单" : "success";
      case 3:
        return text ? "按钮" : "info";
      default:
        return text ? "未知" : "warning";
    }
  };

  const columns: TableColumnList = [
    {
      label: "菜单名称",
      prop: "title",
      align: "left",
      cellRenderer: ({ row }) => (
        <>
          <span class="inline-block mr-1">
            {h(useRenderIcon(row.icon), {
              style: { paddingTop: "1px" }
            })}
          </span>
          <span>{row.title}</span>
        </>
      )
    },
    {
      label: "菜单类型",
      prop: "menu_type",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={getMenuType(row.menu_type)}
          effect="plain"
        >
          {getMenuType(row.menu_type, true)}
        </el-tag>
      )
    },
    {
      label: "路由路径",
      prop: "path"
    },
    {
      label: "组件路径",
      prop: "component",
      formatter: ({ path, component }) =>
        isAllEmpty(component) ? path : component
    },
    {
      label: "权限标识",
      prop: "permission"
    },
    {
      label: "排序",
      prop: "sort",
      width: 100
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.status === 1 ? "success" : "danger"}
          effect="plain"
        >
          {row.status === 1 ? "启用" : "禁用"}
        </el-tag>
      )
    },
    {
      label: "隐藏",
      prop: "hide_in_menu",
      formatter: ({ hide_in_menu }) => (hide_in_menu ? "是" : "否"),
      width: 100
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val: MenuItem[]) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl: any) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { code, data } = await getMenuList();
      if (code === 0) {
        let newData = data || [];
        if (!isAllEmpty(form.title)) {
          // 前端搜索菜单名称（支持树形数据递归搜索）
          newData = filterMenuTree(newData, form.title);
        }
        dataList.value = newData;
      }
    } catch (error) {
      console.error("获取菜单列表失败:", error);
      dataList.value = [];
    } finally {
      loading.value = false;
    }
  }

  /** 递归过滤菜单树 */
  function filterMenuTree(menus: MenuItem[], keyword: string): MenuItem[] {
    const result: MenuItem[] = [];
    for (const menu of menus) {
      // 检查当前菜单是否匹配
      const titleMatch = menu.title?.includes(keyword);
      // 递归检查子菜单
      const filteredChildren = menu.children
        ? filterMenuTree(menu.children, keyword)
        : [];

      if (titleMatch || filteredChildren.length > 0) {
        result.push({
          ...menu,
          children:
            filteredChildren.length > 0 ? filteredChildren : menu.children
        });
      }
    }
    return result;
  }

  function formatHigherMenuOptions(treeList: MenuItem[]) {
    if (!treeList || !treeList.length) return [];
    const newTreeList: any[] = [];
    for (let i = 0; i < treeList.length; i++) {
      const item: any = {
        id: treeList[i].id,
        title: treeList[i].title,
        children: []
      };
      if (treeList[i].children && treeList[i].children.length > 0) {
        item.children = formatHigherMenuOptions(treeList[i].children!);
      }
      newTreeList.push(item);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: MenuItem) {
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          menuType: row?.menu_type ?? 2,
          higherMenuOptions: formatHigherMenuOptions(cloneDeep(dataList.value)),
          parentId: row?.parent_id ?? 0,
          title: row?.title ?? "",
          name: row?.name ?? "",
          path: row?.path ?? "",
          component: row?.component ?? "",
          sort: row?.sort ?? 0,
          icon: row?.icon ?? "",
          permission: row?.permission ?? "",
          hideInMenu: row?.hide_in_menu ?? false,
          keepAlive: row?.keep_alive ?? true,
          status: row?.status ?? 1
        }
      },
      width: "45%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: async (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        FormRef.validate(async (valid: boolean) => {
          if (valid) {
            try {
              const menuData: MenuCreate | MenuUpdate = {
                parent_id: curData.parentId || 0,
                name: curData.name,
                path: curData.path,
                component: curData.component || undefined,
                title: curData.title,
                icon: curData.icon || undefined,
                sort: curData.sort,
                hide_in_menu: curData.hideInMenu,
                keep_alive: curData.keepAlive,
                permission: curData.permission || undefined,
                menu_type: curData.menuType,
                status: curData.status
              };

              if (title === "新增") {
                const { code, message: msg } = await createMenu(
                  menuData as MenuCreate
                );
                if (code === 0) {
                  message(`新增菜单【${curData.title}】成功`, {
                    type: "success"
                  });
                  done();
                  onSearch();
                } else {
                  message(msg || "新增失败", { type: "error" });
                }
              } else {
                const { code, message: msg } = await updateMenu(
                  row!.id,
                  menuData as MenuUpdate
                );
                if (code === 0) {
                  message(`修改菜单【${curData.title}】成功`, {
                    type: "success"
                  });
                  done();
                  onSearch();
                } else {
                  message(msg || "修改失败", { type: "error" });
                }
              }
            } catch (error: any) {
              message(error?.message || "操作失败", { type: "error" });
            }
          }
        });
      }
    });
  }

  async function handleDelete(row: MenuItem) {
    try {
      const { code, message: msg } = await deleteMenu(row.id);
      if (code === 0) {
        message(`删除菜单【${row.title}】成功`, { type: "success" });
        onSearch();
      } else {
        message(msg || "删除失败", { type: "error" });
      }
    } catch (error: any) {
      message(error?.message || "删除失败", { type: "error" });
    }
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改菜单 */
    openDialog,
    /** 删除菜单 */
    handleDelete,
    handleSelectionChange
  };
}
