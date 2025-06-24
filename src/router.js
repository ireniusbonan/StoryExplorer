export default class Router {
  constructor(storyPresenter, authPresenter) {
    this.storyPresenter = storyPresenter; // Mengganti 'presenter' menjadi 'storyPresenter' untuk kejelasan
    this.authPresenter = authPresenter;

    // Tambahkan event listener untuk hashchange
    window.addEventListener("hashchange", () => this.route());
  }

  init() {
    // Panggil route saat inisialisasi untuk menangani URL awal
    this.route();
  }

  route() {
    let hash = location.hash || "#/login"; // Default ke login jika tidak ada hash

    // --- Autentikasi Guard ---
    // Jika tidak login DAN hash bukan halaman login/register, paksa ke login
    if (
      !this.authPresenter.isLoggedIn() &&
      !hash.startsWith("#/login") &&
      !hash.startsWith("#/register")
    ) {
      location.hash = "#/login";
      return;
    }

    // --- Implementasi View Transition API ---
    // Fungsi wrapper untuk transisi halaman yang halus
    const transition = (callback) => {
      // Pastikan View Transitions API didukung sebelum menggunakannya
      if (document.startViewTransition) {
        document.startViewTransition(callback);
      } else {
        callback(); // Fallback jika tidak didukung
      }
    };

    // --- Logika Routing ---
    if (hash.startsWith("#/detail/")) {
      const id = hash.split("/")[2]; // Ambil ID cerita dari hash
      transition(() => this.storyPresenter.showStoryDetail(id));
    } else if (hash.startsWith("#/stories")) {
      transition(() => this.storyPresenter.showStoryList());
    } else if (hash.startsWith("#/add")) {
      transition(() => this.storyPresenter.showAddStoryForm());
    } else if (hash.startsWith("#/login")) {
      transition(() => this.authPresenter.showLogin());
    } else if (hash.startsWith("#/register")) {
      transition(() => this.authPresenter.showRegister());
    } else if (hash.startsWith("#/logout")) {
      transition(() => this.authPresenter.logout());
    } else if (hash.startsWith("#/offline")) {
      // Rute baru untuk View offline
      // Panggil method showOfflineMessage dari StoryPresenter
      transition(() =>
        this.storyPresenter.showOfflineMessage(
          "Anda sedang offline atau terjadi masalah jaringan."
        )
      );
    } else {
      // Fallback default: jika hash tidak dikenali, arahkan ke daftar cerita
      transition(() => this.storyPresenter.showStoryList());
    }
  }
}
