interface FormItemProps {
  id?: number;
  /** 用于判断是`新增`还是`修改` */
  title: string;
  username: string;
  real_name: string;
  password: string;
  phone: string;
  email: string;
  status: number;
  role_ids: number[];
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
