// Impor semua modul yang dibutuhkan
import StoryPresenter from "./presenter/storyPresenter.js";
import AuthPresenter from "./presenter/authPresenter.js";
import AuthModel from "./model/authModel.js";
import StoryModel from "./model/storyModel.js";
import IndexedDbModel from "./model/indexedDbModel.js";
import Router from "./router.js";
import { showNotification } from "./utils/notify.js"; // Notifikasi
import "./styles.css";

// ✅ Tidak perlu import "./utils/sw-register.js" lagi

document.addEventListener("DOMContentLoaded", async () => {
  const mainContainer = document.getElementById("main-content");

  // ✅ 1. Inisialisasi IndexedDB
  const indexedDbModel = new IndexedDbModel();
  await indexedDbModel._initDb();
  console.log("✅ IndexedDB initialized");

  // ✅ 2. Inisialisasi Model dan Presenter
  const authModel = new AuthModel();
  const storyModel = new StoryModel(indexedDbModel);
  const storyPresenter = new StoryPresenter(storyModel, mainContainer);
  const authPresenter = new AuthPresenter(authModel, mainContainer);

  // ✅ 3. Inisialisasi Router SPA
  const router = new Router(storyPresenter, authPresenter);
  router.init();

  // ✅ 4. (DIHAPUS) Tidak perlu lagi swRegister();

  // ✅ 5. Setup Logout (tanpa reload)
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      authPresenter.logout();
    });
  }

  // ✅ 6. Skip to content (Aksesibilitas)
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      skipLink.blur();
      mainContainer.setAttribute("tabindex", "-1");
      mainContainer.focus();
      mainContainer.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ✅ 7. Minta izin notifikasi jika belum
  if ("Notification" in window && Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission();
      console.log("🔔 Notification permission:", permission);
      if (permission === "granted") {
        showNotification("Notifikasi diaktifkan", {
          body: "Anda akan menerima pemberitahuan.",
          icon: "/icons/icon-192x192.png",
        });
      }
    } catch (err) {
      console.warn("⚠️ Gagal meminta izin notifikasi:", err);
    }
  }
});
