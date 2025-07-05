export default class OfflineView {
  constructor({
    message = "Anda sedang offline atau terjadi masalah jaringan.",
  }) {
    this.message = message;
    this.container = null;
    this._handleReload = this._handleReload.bind(this); // Bind untuk removeEventListener
  }

  getTemplate() {
    return `
      <section class="offline-container" role="alert" aria-live="assertive" aria-label="Status koneksi offline">
        <h2 class="offline-title" style="font-size:1.5rem; color:#d9534f;">Koneksi Terputus</h2>
        <p class="offline-message" style="margin-bottom:1rem;">${this.message}</p>
        <p class="offline-suggestion">Silakan periksa koneksi internet Anda atau coba lagi nanti.</p>
        <img 
          src="/icons/offline-icon.svg" 
          alt="Ilustrasi koneksi terputus" 
          class="offline-icon" 
          width="150" 
          height="150" 
          loading="lazy"
        />
        <br />
        <button 
          id="reloadApp" 
          class="btn-primary" 
          aria-label="Muat ulang aplikasi"
          style="margin-top: 1.5rem; padding: 0.5rem 1rem; font-size: 1rem; border-radius: 8px; background-color: #007bff; color: #fff; border: none; cursor: pointer;"
        >
          Muat Ulang Aplikasi
        </button>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    this.container.innerHTML = this.getTemplate();
    this._bindEvents();
  }

  _bindEvents() {
    const reloadButton = this.container.querySelector("#reloadApp");
    if (reloadButton) {
      reloadButton.addEventListener("click", this._handleReload);
    }
  }

  _handleReload() {
    window.location.reload(); // Hard reload seluruh aplikasi
  }

  destroy() {
    if (!this.container) return;

    const reloadButton = this.container.querySelector("#reloadApp");
    if (reloadButton) {
      reloadButton.removeEventListener("click", this._handleReload);
    }

    this.container.innerHTML = ""; // Bersihkan DOM
  }
}
