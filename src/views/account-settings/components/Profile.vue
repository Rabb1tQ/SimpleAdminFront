<script setup lang="ts">
import { message } from "@/utils/message";
import { onMounted, reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { deviceDetection } from "@pureadmin/utils";
import { getProfile, updateProfile } from "@/api/profile";

defineOptions({
  name: "Profile"
});

const emit = defineEmits(["refresh"]);

const userInfoFormRef = ref<FormInstance>();
const loading = ref(false);

const userInfos = reactive({
  real_name: "",
  email: "",
  phone: "",
  desc: "",
  home_path: "/dashboard"
});

const rules = reactive<FormRules>({
  real_name: [{ required: true, message: "姓名必填", trigger: "blur" }]
});

function queryEmail(queryString, callback) {
  const emailList = [
    { value: "@qq.com" },
    { value: "@126.com" },
    { value: "@163.com" }
  ];
  let results = [];
  let queryList = [];
  emailList.map(item =>
    queryList.push({ value: queryString.split("@")[0] + item.value })
  );
  results = queryString
    ? queryList.filter(
        item =>
          item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
      )
    : queryList;
  callback(results);
}

// 更新信息
const onSubmit = async (formEl: FormInstance) => {
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true;
      try {
        const { code, msg } = await updateProfile({
          real_name: userInfos.real_name,
          email: userInfos.email,
          phone: userInfos.phone,
          desc: userInfos.desc,
          home_path: userInfos.home_path
        });
        if (code === 0) {
          message("更新信息成功", { type: "success" });
          emit("refresh");
        } else {
          message(msg || "更新信息失败", { type: "error" });
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

onMounted(async () => {
  const { code, data } = await getProfile();
  if (code === 0) {
    Object.assign(userInfos, data);
  }
});
</script>

<template>
  <div :class="['min-w-45', deviceDetection() ? 'max-w-full' : 'max-w-[70%]']">
    <h3 class="my-8!">个人信息</h3>
    <el-form
      ref="userInfoFormRef"
      label-position="top"
      :rules="rules"
      :model="userInfos"
    >
      <el-form-item label="姓名" prop="real_name">
        <el-input v-model="userInfos.real_name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-autocomplete
          v-model="userInfos.email"
          :fetch-suggestions="queryEmail"
          :trigger-on-focus="false"
          placeholder="请输入邮箱"
          clearable
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input
          v-model="userInfos.phone"
          placeholder="请输入联系电话"
          clearable
        />
      </el-form-item>
      <el-form-item label="首页路径">
        <el-input
          v-model="userInfos.home_path"
          placeholder="请输入首页路径"
          clearable
        />
      </el-form-item>
      <el-form-item label="简介">
        <el-input
          v-model="userInfos.desc"
          placeholder="请输入简介"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 8 }"
          maxlength="56"
          show-word-limit
        />
      </el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        @click="onSubmit(userInfoFormRef)"
      >
        更新信息
      </el-button>
    </el-form>
  </div>
</template>
