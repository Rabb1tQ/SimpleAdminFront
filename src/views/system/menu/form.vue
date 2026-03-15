<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { IconSelect } from "@/components/ReIcon";
import Segmented from "@/components/ReSegmented";
import {
  menuTypeOptions,
  showLinkOptions,
  keepAliveOptions,
  statusOptions
} from "./utils/enums";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    menuType: 2,
    higherMenuOptions: [],
    parentId: 0,
    title: "",
    name: "",
    path: "",
    component: "",
    sort: 0,
    icon: "",
    permission: "",
    hideInMenu: false,
    keepAlive: true,
    status: 1
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="菜单类型">
          <Segmented
            v-model="newFormInline.menuType"
            :options="menuTypeOptions"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="上级菜单">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherMenuOptions"
            :props="{
              value: 'id',
              label: 'title',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择上级菜单"
          >
            <template #default="{ node, data }">
              <span>{{ data.title }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单名称" prop="title">
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="请输入菜单名称"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.menuType !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="路由名称" prop="name">
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入路由名称"
          />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType !== 3" :value="12" :xs="24" :sm="24">
        <el-form-item label="路由路径" prop="path">
          <el-input
            v-model="newFormInline.path"
            clearable
            placeholder="请输入路由路径"
          />
        </el-form-item>
      </re-col>
      <re-col
        v-show="newFormInline.menuType === 2"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="组件路径">
          <el-input
            v-model="newFormInline.component"
            clearable
            placeholder="请输入组件路径"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单排序">
          <el-input-number
            v-model="newFormInline.sort"
            class="w-full!"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-show="newFormInline.menuType !== 3"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="菜单图标">
          <IconSelect v-model="newFormInline.icon" class="w-full" />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.menuType === 3" :value="12" :xs="24" :sm="24">
        <!-- 按钮级别权限设置 -->
        <el-form-item label="权限标识" prop="permission">
          <el-input
            v-model="newFormInline.permission"
            clearable
            placeholder="请输入权限标识"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-show="newFormInline.menuType !== 3"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="是否隐藏">
          <Segmented
            :modelValue="newFormInline.hideInMenu ? 1 : 0"
            :options="showLinkOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.hideInMenu = value;
              }
            "
          />
        </el-form-item>
      </re-col>

      <re-col
        v-show="newFormInline.menuType === 2"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="缓存页面">
          <Segmented
            :modelValue="newFormInline.keepAlive ? 0 : 1"
            :options="keepAliveOptions"
            @change="
              ({ option: { value } }) => {
                newFormInline.keepAlive = value;
              }
            "
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态">
          <Segmented v-model="newFormInline.status" :options="statusOptions" />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
