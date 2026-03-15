import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 验证路由路径格式 */
const validatePath = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error("路由路径为必填项"));
  } else if (!value.startsWith("/")) {
    callback(new Error('路由路径必须以 "/" 开头'));
  } else {
    callback();
  }
};

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  title: [{ required: true, message: "菜单名称为必填项", trigger: "blur" }],
  name: [{ required: true, message: "路由名称为必填项", trigger: "blur" }],
  path: [{ required: true, validator: validatePath, trigger: "blur" }]
});
