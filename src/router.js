export default class Router {
  constructor(storyPresenter, authPresenter) {
    this.storyPresenter = storyPresenter;
    this.authPresenter = authPresenter;

    // Bind metode handleNavigation agar bisa dipakai dari luar
    this.handleNavigation = this.route.bind(this);

    // Dengarkan perubahan hash untuk navigasi
    window.addEventListener("hashchange", this.handleNavigation);
  }

  /**
   * Dipanggil saat aplikasi pertama kali dimuat
   */
  init() {
    this.route(); // Tangani hash saat ini
  }

  /**
   * Menentukan tampilan berdasarkan hash URL
   */
  route() {
    let hash = location.hash || "#/login"; // Default ke login jika tidak ada hash

    // ✅ 1. Guard: Paksa login jika belum login dan bukan di halaman login/register
    if (
      !this.authPresenter.isLoggedIn() &&
      !hash.startsWith("#/login") &&
      !hash.startsWith("#/register")
    ) {
      location.hash = "#/login";
      return;
    }

    // ✅ 2. Gunakan View Transition API jika tersedia
    const transition = (callback) => {
      if (document.startViewTransition) {
        document.startViewTransition(callback);
      } else {
        callback(); // fallback biasa
      }
    };

    // ✅ 3. Routing berdasarkan hash
    if (hash.startsWith("#/detail/")) {
      const id = hash.split("/")[2]; // contoh: #/detail/abc123
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
      transition(() =>
        this.storyPresenter.showOfflineMessage(
          "Anda sedang offline atau terjadi masalah jaringan."
        )
      );
    } else {
      // ✅ 4. Fallback: arahkan ke daftar cerita
      transition(() => this.storyPresenter.showStoryList());
    }
  }
}
