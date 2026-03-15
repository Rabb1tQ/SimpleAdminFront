<script setup lang="ts">
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify"
});

interface Emits {
  (e: "update:code", code: string): void;
  (e: "update:key", key: string): void;
}

const emit = defineEmits<Emits>();

const { imgSrc, captchaKey, getImgCode } = useImageVerify();

// 暴露验证码 key 给父组件
const getKey = () => captchaKey.value;

defineExpose({ getKey, getImgCode });
</script>

<template>
  <img
    v-if="imgSrc"
    :src="imgSrc"
    width="120"
    height="40"
    class="cursor-pointer"
    @click="getImgCode"
  />
</template>
