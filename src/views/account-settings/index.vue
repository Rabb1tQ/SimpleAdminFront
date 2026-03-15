<script setup lang="ts">
import { useRouter } from "vue-router";
import { ReText } from "@/components/ReText";
import Profile from "./components/Profile.vue";
import { ref, onMounted, onBeforeMount } from "vue";
import Password from "./components/Password.vue";
import { useGlobal, deviceDetection } from "@pureadmin/utils";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import LaySidebarTopCollapse from "@/layout/components/lay-sidebar/components/SidebarTopCollapse.vue";
import { getProfile } from "@/api/profile";

import leftLine from "~icons/ri/arrow-left-s-line";
import ProfileIcon from "~icons/ri/user-3-line";
import PasswordIcon from "~icons/ri/lock-password-line";

defineOptions({
  name: "AccountSettings"
});

const router = useRouter();
const isOpen = ref(deviceDetection() ? false : true);
const { $storage } = useGlobal<GlobalPropertiesApi>();
onBeforeMount(() => {
  useDataThemeChange().dataThemeChange($storage.layout?.overallStyle);
});

const userInfo = ref<{
  avatar?: string;
  username?: string;
  real_name?: string;
}>({
  avatar: "",
  username: "",
  real_name: ""
});

const panes = [
  {
    key: "profile",
    label: "个人信息",
    icon: ProfileIcon,
    component: Profile
  },
  {
    key: "password",
    label: "修改密码",
    icon: PasswordIcon,
    component: Password
  }
];
const witchPane = ref("profile");

const refreshUserInfo = async () => {
  const { code, data } = await getProfile();
  if (code === 0) {
    userInfo.value = data;
  }
};

onMounted(async () => {
  await refreshUserInfo();
});
</script>

<template>
  <el-container class="h-full">
    <el-aside
      v-if="isOpen"
      class="pure-account-settings overflow-hidden px-2 dark:bg-(--el-bg-color)! border-r border-(--pure-border-color)"
      :width="deviceDetection() ? '180px' : '240px'"
    >
      <el-menu :default-active="witchPane" class="pure-account-settings-menu">
        <div
          class="h-12.5! text-(--pure-theme-menu-text) cursor-pointer text-sm transition-all duration-300 ease-in-out hover:scale-105 will-change-transform transform-gpu origin-center hover:text-base! hover:text-(--pure-theme-menu-title-hover)!"
          @click="router.go(-1)"
        >
          <div
            class="h-full flex items-center px-(--el-menu-base-level-padding)"
          >
            <IconifyIconOffline :icon="leftLine" />
            <span class="ml-2">返回</span>
          </div>
        </div>
        <div class="flex items-center ml-8 my-4">
          <el-avatar :size="48" :src="userInfo.avatar">
            <IconifyIconOffline icon="ri:user-3-line" width="24" />
          </el-avatar>
          <div class="ml-4 flex flex-col max-w-32.5">
            <ReText class="font-bold self-baseline!">
              {{ userInfo.real_name }}
            </ReText>
            <ReText class="self-baseline!" type="info">
              {{ userInfo.username }}
            </ReText>
          </div>
        </div>
        <el-menu-item
          v-for="item in panes"
          :key="item.key"
          :index="item.key"
          @click="
            () => {
              witchPane = item.key;
              if (deviceDetection()) {
                isOpen = !isOpen;
              }
            }
          "
        >
          <div class="flex items-center z-10">
            <el-icon><IconifyIconOffline :icon="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </div>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <LaySidebarTopCollapse
        v-if="deviceDetection()"
        class="px-0"
        :is-active="isOpen"
        @toggleClick="isOpen = !isOpen"
      />
      <component
        :is="panes.find(item => item.key === witchPane).component"
        :class="[!deviceDetection() && 'ml-30']"
        @refresh="refreshUserInfo"
      />
    </el-main>
  </el-container>
</template>

<style lang="scss">
.pure-account-settings {
  background: var(--pure-theme-menu-bg) !important;
}

.pure-account-settings-menu {
  background-color: transparent;
  border: none;

  .el-menu-item {
    height: 48px !important;
    color: var(--pure-theme-menu-text);
    background-color: transparent !important;
    transition: color 0.2s;

    &:hover {
      color: var(--pure-theme-menu-title-hover) !important;
    }

    &.is-active {
      color: var(--el-color-primary) !important;
    }
  }
}
</style>
