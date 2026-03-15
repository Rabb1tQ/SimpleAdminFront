interface FormItemProps {
  /** 菜单类型（1代表目录、2代表菜单、3代表按钮）*/
  menuType: number;
  higherMenuOptions: Record<string, unknown>[];
  parentId: number;
  title: string;
  name: string;
  path: string;
  component: string;
  sort: number;
  icon: string;
  permission: string;
  hideInMenu: boolean;
  keepAlive: boolean;
  status: number;
}

interface FormProps {
  formInline: FormItemProps;
}

/** 菜单列表项 */
interface MenuItem {
  id: number;
  parent_id: number;
  name: string;
  path: string;
  component: string | null;
  title: string;
  icon: string | null;
  sort: number;
  status: number;
  hide_in_menu: boolean;
  keep_alive: boolean;
  permission: string | null;
  menu_type: number;
  created_at: string;
  children?: MenuItem[];
}

export type { FormItemProps, FormProps, MenuItem };
