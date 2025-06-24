import StoryPresenter from "./presenter/storyPresenter.js";
import AuthPresenter from "./presenter/authPresenter.js";
import AuthModel from "./model/authModel.js";
import StoryModel from "./model/storyModel.js";
import IndexedDbModel from "./model/indexedDbModel.js"; // Impor model IndexedDB baru
import Router from "./router.js";
import swRegister from "./utils/sw-register.js"; // Impor utilitas pendaftaran SW
import "./styles.css";

document.addEventListener("DOMContentLoaded", async () => {
  const mainContainer = document.getElementById("main-content");

  // Inisialisasi IndexedDB Model terlebih dahulu
  const indexedDbModel = new IndexedDbModel();
  // Pastikan IndexedDB siap sebelum digunakan oleh StoryModel
  await indexedDbModel._initDb();
  console.log("IndexedDB initialized in main.js");

  const authModel = new AuthModel();
  // Injeksi indexedDbModel ke StoryModel agar StoryModel bisa decide fallback ke IndexedDB
  const storyModel = new StoryModel(indexedDbModel);

  // Inject model ke presenter
  const storyPresenter = new StoryPresenter(storyModel, mainContainer);
  const authPresenter = new AuthPresenter(authModel, mainContainer);

  const router = new Router(storyPresenter, authPresenter);
  router.init();

  // Daftarkan Service Worker
  await swRegister(); // Panggil fungsi pendaftaran Service Worker
  console.log("Service Worker registration initiated in main.js");

  // Event listener tombol logout agar langsung memanggil logout tanpa reload
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      authPresenter.logout();
    });
  }

  // Skip link untuk aksesibilitas keyboard
  // Pastikan script ini hanya ada di sini, tidak di index.html
  const skipLink = document.querySelector(".skip-link");
  if (skipLink) {
    // Tambahkan pengecekan if(skipLink)
    skipLink.addEventListener("click", (event) => {
      event.preventDefault();
      skipLink.blur();
      mainContainer.setAttribute("tabindex", "-1");
      mainContainer.focus();
      mainContainer.scrollIntoView({ behavior: "smooth" });
    });
  }
});
