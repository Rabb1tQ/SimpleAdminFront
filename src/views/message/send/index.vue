<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { message } from "@/utils/message";
import { sendMessage } from "@/api/message";
import { getUserList } from "@/api/user";
import { getAllRoles } from "@/api/role";
import { getAllTenants } from "@/api/tenant";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "MessageSend"
});

const loading = ref(false);
const userStore = useUserStoreHook();
const isSuperuser = computed(() => userStore.roles.includes("superadmin"));

const form = reactive({
  title: "",
  content: "",
  type: "SYSTEM",
  receiver_type: "USER",
  receiver_ids: [] as number[]
});

const rules = {
  title: [{ required: true, message: "请输入消息标题", trigger: "blur" }],
  receiver_type: [
    { required: true, message: "请选择接收对象类型", trigger: "change" }
  ]
};

const formRef = ref();
const userOptions = ref([]);
const roleOptions = ref([]);
const tenantOptions = ref([]);

const receiverTypeOptions = computed(() => {
  if (isSuperuser.value) {
    return [
      { label: "全员", value: "ALL" },
      { label: "指定租户", value: "TENANT" },
      { label: "指定角色", value: "ROLE" },
      { label: "指定用户", value: "USER" }
    ];
  }
  return [{ label: "指定用户", value: "USER" }];
});

async function loadOptions() {
  try {
    const [usersRes, rolesRes, tenantsRes] = await Promise.all([
      getUserList({ page: 1, page_size: 1000 }),
      getAllRoles(),
      getAllTenants()
    ]);
    userOptions.value = usersRes.data?.items || [];
    roleOptions.value = rolesRes.data || [];
    tenantOptions.value = tenantsRes.data || [];
  } catch {
    // Ignore errors for non-superuser
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  if (form.receiver_type !== "ALL" && form.receiver_ids.length === 0) {
    message("请选择接收对象", { type: "warning" });
    return;
  }

  loading.value = true;
  try {
    const { data } = await sendMessage({
      title: form.title,
      content: form.content,
      type: form.type,
      receiver_type: form.receiver_type,
      receiver_ids: form.receiver_type === "ALL" ? [] : form.receiver_ids
    });
    message(`发送成功，共发送 ${data.send_count} 条消息`, { type: "success" });
    resetForm();
  } catch {
    message("发送失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.title = "";
  form.content = "";
  form.type = "SYSTEM";
  form.receiver_type = "USER";
  form.receiver_ids = [];
  formRef.value?.resetFields();
}

onMounted(() => {
  loadOptions();
});
</script>

<template>
  <div class="main">
    <el-card shadow="hover">
      <template #header>
        <span>发送消息</span>
      </template>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 600px"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="消息类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="SYSTEM">系统通知</el-radio>
            <el-radio value="BUSINESS">业务通知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="5"
            placeholder="请输入消息内容"
          />
        </el-form-item>
        <el-form-item label="接收对象" prop="receiver_type">
          <el-radio-group v-model="form.receiver_type">
            <el-radio
              v-for="item in receiverTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="form.receiver_type === 'TENANT'"
          label="选择租户"
          prop="receiver_ids"
        >
          <el-select
            v-model="form.receiver_ids"
            multiple
            placeholder="请选择租户"
            style="width: 100%"
          >
            <el-option
              v-for="item in tenantOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.receiver_type === 'ROLE'"
          label="选择角色"
          prop="receiver_ids"
        >
          <el-select
            v-model="form.receiver_ids"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="form.receiver_type === 'USER'"
          label="选择用户"
          prop="receiver_ids"
        >
          <el-select
            v-model="form.receiver_ids"
            multiple
            filterable
            placeholder="请选择用户"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            发送
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
