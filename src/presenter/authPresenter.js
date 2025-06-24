import LoginView from "../view/loginView.js";
import RegisterView from "../view/registerView.js";
// Impor helper notifikasi baru yang akan kita buat
import {
  requestNotificationPermission,
  subscribePushNotification,
} from "../utils/notification-helper.js";

export default class AuthPresenter {
  /**
   * @param {object} authModel - Instance model autentikasi
   * @param {HTMLElement} mainContainer - Container utama untuk render View
   */
  constructor(authModel, mainContainer) {
    this.model = authModel;
    this.mainContainer =
      mainContainer || document.getElementById("main-content");
    this.currentView = null;
  }

  showLogin() {
    this._destroyCurrentView();
    this.currentView = new LoginView({
      onLogin: (params) => this.handleLogin(params),
      onGoToRegister: () => this.showRegister(),
    });
    this.currentView.render(this.mainContainer);
  }

  showRegister() {
    this._destroyCurrentView();
    this.currentView = new RegisterView({
      onRegister: (params) => this.handleRegister(params),
      onGoToLogin: () => this.showLogin(),
    });
    this.currentView.render(this.mainContainer);
  }

  async handleLogin({ email, password }) {
    if (!email || !password) {
      this.currentView.showError("Email dan password wajib diisi.");
      return;
    }
    try {
      await this.model.login({ email, password });
      this.currentView.showSuccess("Login berhasil!");

      // --- PENAMBAHAN UNTUK PUSH NOTIFICATION ---
      try {
        const permission = await requestNotificationPermission(); // Meminta izin notifikasi
        if (permission === "granted") {
          await subscribePushNotification(); // Melakukan langganan notifikasi
        } else {
          console.warn("Izin notifikasi tidak diberikan atau ditolak.");
        }
      } catch (pushError) {
        console.error("Gagal memproses langganan notifikasi:", pushError);
        // Tampilkan pesan error ke pengguna jika perlu, tapi jangan blokir alur login utama
        this.currentView.showError(
          "Login berhasil, tapi gagal mengaktifkan notifikasi."
        );
      }
      // --- AKHIR PENAMBAHAN ---

      this.currentView.navigateTo("#/stories");
    } catch (error) {
      this.currentView.showError(error.message || "Login gagal.");
    }
  }

  async handleRegister({ name, email, password }) {
    if (!name || !email || !password) {
      this.currentView.showError("Semua kolom wajib diisi.");
      return;
    }
    try {
      await this.model.register({ name, email, password });
      this.currentView.showSuccess("Registrasi berhasil! Silakan login.");
      this.showLogin();
    } catch (error) {
      this.currentView.showError(error.message || "Registrasi gagal.");
    }
  }

  async logout() {
    try {
      await this.model.logout();
      // Anda mungkin ingin menambahkan logika untuk meng-unsubscribe dari push notification di sini
      // Ini adalah praktik terbaik, tapi opsional untuk kriteria Anda saat ini
      // if (navigator.serviceWorker && 'PushManager' in window) {
      //   const registration = await navigator.serviceWorker.ready;
      //   const subscription = await registration.pushManager.getSubscription();
      //   if (subscription) {
      //     await subscription.unsubscribe();
      //     // Panggil API backend untuk menghapus subscription dari database server Anda
      //     // Contoh: await fetch('/api/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint: subscription.endpoint }), headers: { 'Content-Type': 'application/json' } });
      //   }
      // }

      if (this.currentView) {
        this.currentView.showSuccess("Anda telah logout.");
        this.currentView.navigateTo("#/login");
      } else {
        // Fallback jika tidak ada view yang aktif (misal langsung dari URL)
        location.hash = "#/login";
      }
    } catch (error) {
      // Jika ada error saat logout, tampilkan pesan
      if (this.currentView) {
        this.currentView.showError(error.message || "Gagal logout.");
      }
    }
  }

  isLoggedIn() {
    return this.model.isLoggedIn();
  }

  _destroyCurrentView() {
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy();
    }
    this.currentView = null;
  }
}
