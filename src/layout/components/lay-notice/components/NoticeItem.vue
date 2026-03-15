<script setup lang="ts">
import { ListItem } from "../data";
import { ref, PropType, nextTick, inject } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { deviceDetection } from "@pureadmin/utils";

const props = defineProps({
  noticeItem: {
    type: Object as PropType<ListItem>,
    default: () => {}
  }
});

const titleRef = ref(null);
const titleTooltip = ref(false);
const descriptionRef = ref(null);
const descriptionTooltip = ref(false);
const { tooltipEffect } = useNav();
const isMobile = deviceDetection();

// 注入点击处理函数
const handleMessageClick = inject<(id: number) => void>("handleMessageClick");

function hoverTitle() {
  nextTick(() => {
    titleRef.value?.scrollWidth > titleRef.value?.clientWidth
      ? (titleTooltip.value = true)
      : (titleTooltip.value = false);
  });
}

function hoverDescription(event, description) {
  // currentWidth 为文本在页面中所占的宽度，创建标签，加入到页面，获取currentWidth ,最后在移除
  const tempTag = document.createElement("span");
  tempTag.innerText = description;
  tempTag.className = "getDescriptionWidth";
  document.querySelector("body").appendChild(tempTag);
  const currentWidth = (
    document.querySelector(".getDescriptionWidth") as HTMLSpanElement
  ).offsetWidth;
  document.querySelector(".getDescriptionWidth").remove();

  // cellWidth为容器的宽度
  const cellWidth = event.target.offsetWidth;

  // 当文本宽度大于容器宽度两倍时，代表文本显示超过两行
  currentWidth > 2 * cellWidth
    ? (descriptionTooltip.value = true)
    : (descriptionTooltip.value = false);
}

// 点击消息项
function handleClick() {
  if (handleMessageClick && props.noticeItem.id) {
    handleMessageClick(props.noticeItem.id);
  }
}
</script>

<template>
  <div
    class="notice-container border-0 border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#303030] cursor-pointer hover:bg-[#f5f7fa] dark:hover:bg-[#2d2d2d]"
    @click="handleClick"
  >
    <el-avatar
      v-if="noticeItem.avatar"
      :size="30"
      :src="noticeItem.avatar"
      class="notice-container-avatar"
    />
    <div class="notice-container-text">
      <div class="notice-text-title text-[#000000d9] dark:text-white">
        <el-tooltip
          popper-class="notice-title-popper"
          :effect="tooltipEffect"
          :disabled="!titleTooltip"
          :content="noticeItem.title"
          placement="top-start"
          :enterable="!isMobile"
        >
          <div
            ref="titleRef"
            class="notice-title-content"
            @mouseover="hoverTitle"
          >
            {{ noticeItem.title }}
          </div>
        </el-tooltip>
        <el-tag
          v-if="noticeItem?.extra"
          :type="noticeItem?.status"
          size="small"
          class="notice-title-extra"
        >
          {{ noticeItem.extra }}
        </el-tag>
      </div>
      <el-tooltip
        popper-class="notice-description-popper"
        :effect="tooltipEffect"
        :disabled="!descriptionTooltip"
        :content="noticeItem.description"
        placement="top-start"
      >
        <div
          ref="descriptionRef"
          class="notice-text-description"
          @mouseover="hoverDescription($event, noticeItem.description)"
        >
          {{ noticeItem.description }}
        </div>
      </el-tooltip>
      <div class="notice-text-datetime">
        {{ noticeItem.datetime }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notice-container {
  display: flex;
  align-items: flex-start;
  padding-bottom: 12px;
  padding-top: 12px;
  margin: 0 24px;
  border-bottom-style: solid;

  &:last-child {
    border-bottom: none;
  }

  .notice-container-avatar {
    margin-right: 16px;
    background: #f2f2f2;
  }

  .notice-container-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .notice-text-title {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.4;

      .notice-title-content {
        flex: 1;
        width: 200px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .notice-title-extra {
        margin-left: 8px;
      }
    }

    .notice-text-description {
      display: -webkit-box;
      width: 200px;
      margin-bottom: 8px;
      overflow: hidden;
      font-size: 13px;
      line-height: 1.4;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: #00000073;
    }

    .notice-text-datetime {
      font-size: 12px;
      color: #00000073;
    }
  }
}
</style>
