import type { FormRules } from "element-plus";

/** @name 租户表单校验规则 */
export const formRules: FormRules = {
  name: [{ required: true, message: "请输入租户名称", trigger: "blur" }],
  code: [
    { required: true, message: "请输入租户编码", trigger: "blur" },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: "租户编码必须以字母开头，只能包含字母、数字和下划线",
      trigger: "blur"
    }
  ],
  email: [
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: "blur"
    }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: "blur"
    }
  ]
};
