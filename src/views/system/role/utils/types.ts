// 角色表单类型

interface FormItemProps {
  /** 角色ID */
  id?: number;
  /** 角色名称 */
  name: string;
  /** 角色编码 */
  code: string;
  /** 描述 */
  desc?: string;
  /** 备注 */
  remark?: string;
  /** 状态 */
  status?: number;
  /** 菜单ID列表 */
  menu_ids?: number[];
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
