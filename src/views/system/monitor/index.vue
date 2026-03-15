<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getServerInfo, getRedisInfo, getDatabaseInfo } from "@/api/monitor";

defineOptions({
  name: "Monitor"
});

const loading = ref(false);
const serverInfo = ref<any>({});
const redisInfo = ref<any>({});
const databaseInfo = ref<any>({});

const refreshInterval = ref<number | null>(null);

const fetchData = async () => {
  loading.value = true;
  try {
    const [serverRes, redisRes, dbRes] = await Promise.all([
      getServerInfo(),
      getRedisInfo(),
      getDatabaseInfo()
    ]);

    if (serverRes.code === 0) {
      serverInfo.value = serverRes.data;
    }
    if (redisRes.code === 0) {
      redisInfo.value = redisRes.data;
    }
    if (dbRes.code === 0) {
      databaseInfo.value = dbRes.data;
    }
  } catch (error) {
    console.error("获取监控信息失败:", error);
  } finally {
    loading.value = false;
  }
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

onMounted(() => {
  fetchData();
  // 每30秒刷新一次
  refreshInterval.value = window.setInterval(fetchData, 30000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<template>
  <div class="main p-4">
    <el-row :gutter="20">
      <!-- 服务器信息 -->
      <el-col :span="24" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold">服务器信息</span>
              <el-button
                type="primary"
                size="small"
                :loading="loading"
                @click="fetchData"
              >
                刷新
              </el-button>
            </div>
          </template>
          <el-descriptions v-if="serverInfo.system" :column="3" border>
            <el-descriptions-item label="操作系统">
              {{ serverInfo.system?.os }} {{ serverInfo.system?.os_release }}
            </el-descriptions-item>
            <el-descriptions-item label="系统架构">
              {{ serverInfo.system?.architecture }}
            </el-descriptions-item>
            <el-descriptions-item label="主机名">
              {{ serverInfo.system?.hostname }}
            </el-descriptions-item>
            <el-descriptions-item label="Python版本">
              {{ serverInfo.system?.python_version }}
            </el-descriptions-item>
            <el-descriptions-item label="启动时间">
              {{ serverInfo.boot_time }}
            </el-descriptions-item>
            <el-descriptions-item label="运行时长">
              {{ serverInfo.uptime }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- CPU 信息 -->
      <el-col :xs="24" :sm="12" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">CPU 信息</span>
          </template>
          <div v-if="serverInfo.cpu">
            <el-progress
              :percentage="serverInfo.cpu.cpu_percent || 0"
              :color="serverInfo.cpu.cpu_percent > 80 ? '#f56c6c' : '#67c23a'"
              :stroke-width="20"
              class="mb-4"
            />
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="物理核心">
                {{ serverInfo.cpu.cpu_count }} 核
              </el-descriptions-item>
              <el-descriptions-item label="逻辑核心">
                {{ serverInfo.cpu.cpu_count_logical }} 核
              </el-descriptions-item>
              <el-descriptions-item
                v-if="serverInfo.cpu.cpu_freq"
                label="当前频率"
              >
                {{ serverInfo.cpu.cpu_freq?.current }} MHz
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 内存信息 -->
      <el-col :xs="24" :sm="12" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">内存信息</span>
          </template>
          <div v-if="serverInfo.memory">
            <el-progress
              :percentage="serverInfo.memory.percent || 0"
              :color="serverInfo.memory.percent > 80 ? '#f56c6c' : '#67c23a'"
              :stroke-width="20"
              class="mb-4"
            />
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="总内存">
                {{ serverInfo.memory.total }} GB
              </el-descriptions-item>
              <el-descriptions-item label="已使用">
                {{ serverInfo.memory.used }} GB
              </el-descriptions-item>
              <el-descriptions-item label="可用内存">
                {{ serverInfo.memory.available }} GB
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 磁盘信息 -->
      <el-col :xs="24" :sm="12" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">磁盘信息</span>
          </template>
          <div v-if="serverInfo.disk">
            <el-progress
              :percentage="serverInfo.disk.percent || 0"
              :color="serverInfo.disk.percent > 80 ? '#f56c6c' : '#67c23a'"
              :stroke-width="20"
              class="mb-4"
            />
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="总容量">
                {{ serverInfo.disk.total }} GB
              </el-descriptions-item>
              <el-descriptions-item label="已使用">
                {{ serverInfo.disk.used }} GB
              </el-descriptions-item>
              <el-descriptions-item label="剩余空间">
                {{ serverInfo.disk.free }} GB
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- Redis 信息 -->
      <el-col :xs="24" :sm="12" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">Redis 信息</span>
          </template>
          <div v-if="redisInfo.health">
            <el-tag
              :type="redisInfo.health.session ? 'success' : 'danger'"
              class="mb-2"
            >
              Session: {{ redisInfo.health.session ? "正常" : "异常" }}
            </el-tag>
            <el-tag
              :type="redisInfo.health.cache ? 'success' : 'danger'"
              class="mb-2 ml-2"
            >
              Cache: {{ redisInfo.health.cache ? "正常" : "异常" }}
            </el-tag>
            <el-tag
              :type="redisInfo.health.token ? 'success' : 'danger'"
              class="mb-2 ml-2"
            >
              Token: {{ redisInfo.health.token ? "正常" : "异常" }}
            </el-tag>
            <el-descriptions
              v-if="redisInfo.info"
              :column="1"
              border
              size="small"
            >
              <el-descriptions-item label="版本">
                {{ redisInfo.info.version }}
              </el-descriptions-item>
              <el-descriptions-item label="运行模式">
                {{ redisInfo.info.mode }}
              </el-descriptions-item>
              <el-descriptions-item label="内存使用">
                {{ redisInfo.info.used_memory_human }}
              </el-descriptions-item>
              <el-descriptions-item label="连接数">
                {{ redisInfo.info.connected_clients }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>

      <!-- 数据库信息 -->
      <el-col :xs="24" :sm="12" class="mb-4">
        <el-card shadow="hover">
          <template #header>
            <span class="font-bold">数据库信息</span>
          </template>
          <div v-if="databaseInfo.status">
            <el-tag
              :type="databaseInfo.status === 'connected' ? 'success' : 'danger'"
              class="mb-2"
            >
              {{ databaseInfo.status === "connected" ? "已连接" : "连接失败" }}
            </el-tag>
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="数据库类型">
                {{ databaseInfo.type }}
              </el-descriptions-item>
              <el-descriptions-item v-if="databaseInfo.version" label="版本">
                {{ databaseInfo.version }}
              </el-descriptions-item>
              <el-descriptions-item v-if="databaseInfo.size" label="数据库大小">
                {{ databaseInfo.size }} MB
              </el-descriptions-item>
              <el-descriptions-item
                v-if="databaseInfo.connections"
                label="连接数"
              >
                {{ databaseInfo.connections }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.main {
  min-height: calc(100vh - 200px);
}
</style>
