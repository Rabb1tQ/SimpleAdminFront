import { ref, onMounted } from "vue";
import { getCaptcha } from "@/api/user";

/**
 * 后端验证码
 */
export const useImageVerify = () => {
  const imgSrc = ref("");
  const captchaKey = ref("");

  /** 获取验证码 */
  async function getImgCode() {
    try {
      const res = await getCaptcha();
      if (res.code === 0) {
        imgSrc.value = res.data.image;
        captchaKey.value = res.data.key;
      }
    } catch (error) {
      console.error("获取验证码失败:", error);
    }
  }

  onMounted(() => {
    getImgCode();
  });

  return {
    imgSrc,
    captchaKey,
    getImgCode
  };
};
