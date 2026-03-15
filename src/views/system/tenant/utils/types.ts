export interface FormItemProps {
  id?: number;
  name: string;
  code: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: number;
  expire_at?: string;
  remark?: string;
}

export interface FormProps {
  formInline: FormItemProps;
}
