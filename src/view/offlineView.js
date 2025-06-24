export default class OfflineView {
  constructor({ message = "Anda sedang offline atau terjadi masalah." }) {
    this.message = message;
    this.container = null;
  }

  getTemplate() {
    return `
      <section class="offline-container" aria-live="polite" aria-label="Pesan status offline">
        <h2 class="offline-title">Koneksi Terputus</h2>
        <p class="offline-message">${this.message}</p>
        <p class="offline-suggestion">Silakan periksa koneksi internet Anda atau coba lagi nanti.</p>
        <img src="/icons/offline-icon.svg" alt="Ilustrasi ikon offline" class="offline-icon" width="150" height="150">
        <button id="reloadApp" class="btn-primary" style="margin-top: 20px;">Muat Ulang Aplikasi</button>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._bindEvents();
  }

  _bindEvents() {
    const reloadButton = this.container.querySelector("#reloadApp");
    if (reloadButton) {
      reloadButton.addEventListener("click", () => {
        window.location.reload(); // Memuat ulang halaman
      });
    }
  }

  // Metode showError, showSuccess, clearMessage tidak relevan untuk view ini,
  // namun metode destroy tetap penting untuk konsistensi.
  destroy() {
    if (this.container) {
      const reloadButton = this.container.querySelector("#reloadApp");
      if (reloadButton) {
        reloadButton.removeEventListener("click", () => {
          window.location.reload();
        });
      }
      this.container.innerHTML = "";
    }
  }
}
