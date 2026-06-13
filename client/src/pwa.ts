import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("هناك تحديث جديد متاح. هل تريد التحديث الآن؟")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("التطبيق جاهز للعمل بدون إنترنت!");
  },
});
