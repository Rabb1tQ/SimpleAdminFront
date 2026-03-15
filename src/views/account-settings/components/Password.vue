<script setup lang="ts">
import { message } from "@/utils/message";
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { deviceDetection } from "@pureadmin/utils";
import { changePassword } from "@/api/profile";

defineOptions({
  name: "Password"
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  old_password: "",
  new_password: "",
  confirm_password: ""
});

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.new_password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = reactive<FormRules>({
  old_password: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  new_password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 50, message: "密码长度为6-50个字符", trigger: "blur" }
  ],
  confirm_password: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ]
});

// 修改密码
const onSubmit = async (formEl: FormInstance) => {
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true;
      try {
        const { code, msg } = await changePassword({
          old_password: form.old_password,
          new_password: form.new_password
        });
        if (code === 0) {
          message("修改密码成功", { type: "success" });
          formRef.value?.resetFields();
        } else {
          message(msg || "修改密码失败", { type: "error" });
        }
      } catch (error) {
        message(`提交异常 ${error}`, { type: "error" });
      } finally {
        loading.value = false;
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  formEl?.resetFields();
};
</script>

<template>
  <div :class="['min-w-45', deviceDetection() ? 'max-w-full' : 'max-w-[70%]']">
    <h3 class="my-8!">修改密码</h3>
    <el-form ref="formRef" label-position="top" :rules="rules" :model="form">
      <el-form-item label="旧密码" prop="old_password">
        <el-input
          v-model="form.old_password"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="new_password">
        <el-input
          v-model="form.new_password"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm_password">
        <el-input
          v-model="form.confirm_password"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSubmit(formRef)">
          提交
        </el-button>
        <el-button @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
