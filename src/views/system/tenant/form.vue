<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import type { FormProps } from "./utils/types";

const props = defineProps<FormProps>();
const formRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return formRef.value;
}

defineExpose({
  getRef
});
</script>

<template>
  <el-form
    ref="formRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="100px"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="租户名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            placeholder="请输入租户名称"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="租户编码" prop="code">
          <el-input
            v-model="newFormInline.code"
            placeholder="请输入租户编码"
            :disabled="!!newFormInline.id"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="联系人" prop="contact">
          <el-input
            v-model="newFormInline.contact"
            placeholder="请输入联系人"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="newFormInline.phone"
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="newFormInline.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="newFormInline.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="newFormInline.address"
            placeholder="请输入地址"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="过期时间" prop="expire_at">
          <el-date-picker
            v-model="newFormInline.expire_at"
            type="datetime"
            placeholder="请选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="newFormInline.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
