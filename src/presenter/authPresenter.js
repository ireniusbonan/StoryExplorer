import LoginView from "../view/loginView.js";
import RegisterView from "../view/registerView.js";
import {
  requestNotificationPermission,
  subscribePushNotification,
} from "../utils/notification-helper.js";

/**
 * Presenter untuk fitur Autentikasi (Login, Register, Logout)
 */
export default class AuthPresenter {
  /**
   * @param {object} authModel - Instance model autentikasi
   * @param {HTMLElement} mainContainer - Elemen utama untuk merender view
   */
  constructor(authModel, mainContainer) {
    this.model = authModel;
    this.mainContainer =
      mainContainer || document.getElementById("main-content");
    this.currentView = null;
  }

  /**
   * Tampilkan halaman login
   */
  showLogin() {
    this._destroyCurrentView();
    this.currentView = new LoginView({
      onLogin: (params) => this.handleLogin(params),
      onGoToRegister: () => this.showRegister(),
    });
    this.currentView.render(this.mainContainer);
  }

  /**
   * Tampilkan halaman registrasi
   */
  showRegister() {
    this._destroyCurrentView();
    this.currentView = new RegisterView({
      onRegister: (params) => this.handleRegister(params),
      onGoToLogin: () => this.showLogin(),
    });
    this.currentView.render(this.mainContainer);
  }

  /**
   * Menangani proses login pengguna
   * @param {{email: string, password: string}} param0
   */
  async handleLogin({ email, password }) {
    if (!email || !password) {
      this.currentView?.showError("Email dan password wajib diisi.");
      return;
    }

    try {
      await this.model.login({ email, password });
      this.currentView?.showSuccess("Login berhasil!");

      // ✅ Minta izin dan subscribe notifikasi push
      try {
        const permission = await requestNotificationPermission();
        if (permission === "granted") {
          await subscribePushNotification();
        } else {
          console.warn("Izin notifikasi tidak diberikan.");
        }
      } catch (pushErr) {
        console.error("Push subscription error:", pushErr);
        this.currentView?.showError(
          "Login berhasil, tapi gagal mengaktifkan notifikasi."
        );
      }

      this.currentView?.navigateTo("#/stories");
    } catch (error) {
      this.currentView?.showError(error.message || "Login gagal.");
    }
  }

  /**
   * Menangani proses registrasi pengguna
   * @param {{name: string, email: string, password: string}} param0
   */
  async handleRegister({ name, email, password }) {
    if (!name || !email || !password) {
      this.currentView?.showError("Semua kolom wajib diisi.");
      return;
    }

    try {
      await this.model.register({ name, email, password });
      this.currentView?.showSuccess("Registrasi berhasil! Silakan login.");
      this.showLogin();
    } catch (error) {
      this.currentView?.showError(error.message || "Registrasi gagal.");
    }
  }

  /**
   * Logout pengguna dan arahkan ke login
   */
  async logout() {
    try {
      await this.model.logout();

      // (Optional) Unsubscribe push notification saat logout
      // Lihat catatan jika diperlukan untuk backend

      if (this.currentView) {
        this.currentView.showSuccess("Anda telah logout.");
        this.currentView.navigateTo("#/login");
      } else {
        location.hash = "#/login";
      }
    } catch (error) {
      this.currentView?.showError(error.message || "Gagal logout.");
    }
  }

  /**
   * Mengecek status login pengguna
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.model.isLoggedIn();
  }

  /**
   * Menghapus tampilan saat ini untuk mencegah memory leak
   */
  _destroyCurrentView() {
    if (this.currentView?.destroy) {
      this.currentView.destroy();
    }
    this.currentView = null;
  }
}
