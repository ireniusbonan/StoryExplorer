import L from "leaflet";

export default class StoryDetailView {
  constructor({ story, onBack, onSaveOffline, onDeleteOffline }) {
    this.story = story || null;
    this.container = null;
    this.map = null;
    this.onBack = onBack; // Callback saat tombol kembali diklik
    this.onSaveOffline = onSaveOffline; // BARU: Callback untuk menyimpan cerita offline
    this.onDeleteOffline = onDeleteOffline; // BARU: Callback untuk menghapus cerita offline
    this.isStorySavedOffline = false; // BARU: State untuk melacak status simpan offline
  }

  getTemplate() {
    if (!this.story) {
      return `<section aria-live="polite" aria-label="Memuat detail cerita"><p>Memuat data cerita...</p></section>`;
    }

    // Tentukan teks dan ID tombol berdasarkan status penyimpanan offline
    const saveButtonText = this.isStorySavedOffline
      ? "Hapus dari Offline"
      : "Simpan Offline";
    const saveButtonId = this.isStorySavedOffline
      ? "deleteOfflineBtn"
      : "saveOfflineBtn";

    return `
      <section aria-label="Detail cerita">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <button id="backBtn" aria-label="Kembali ke daftar cerita" style="cursor:pointer;">
                ← Kembali
            </button>
            <button id="${saveButtonId}" aria-label="${saveButtonText}" class="btn-primary-small">
                ${saveButtonText}
            </button>
        </div>
        
        <h2 id="story-detail-title">${this.story.name || "Anonim"}</h2>
        <img
          src="${this.story.photoUrl || this.story.photo}"
          alt="Foto cerita dari ${this.story.name || "Anonim"}"
          style="max-width:100%; border-radius:12px; margin-bottom:12px; aspect-ratio: 16/9; object-fit: cover;"
        />
        <p>${this.story.description}</p>
        <p><strong>Latitude:</strong> ${this.story.lat}</p>
        <p><strong>Longitude:</strong> ${this.story.lon}</p>
        <div id="detailMap" style="height: 300px; border-radius: 12px;" aria-label="Peta lokasi cerita"></div>
        <div id="message" role="alert" aria-live="assertive" style="margin-top: 12px;"></div>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._initMap();
    this._bindEvents();
  }

  _bindEvents() {
    const backBtn = this.container.querySelector("#backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (this.onBack) this.onBack();
      });
    }

    // === BARU: Event listener untuk tombol Simpan/Hapus Offline ===
    const saveDeleteBtn =
      this.container.querySelector("#saveOfflineBtn") ||
      this.container.querySelector("#deleteOfflineBtn");
    if (saveDeleteBtn) {
      saveDeleteBtn.addEventListener("click", () => {
        if (this.isStorySavedOffline) {
          // Jika sudah disimpan, panggil callback hapus
          if (this.onDeleteOffline) this.onDeleteOffline(this.story.id);
        } else {
          // Jika belum disimpan, panggil callback simpan
          if (this.onSaveOffline) this.onSaveOffline(this.story);
        }
      });
    }
    // ==========================================================
  }

  _initMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (
      !this.story ||
      typeof this.story.lat !== "number" ||
      typeof this.story.lon !== "number" ||
      isNaN(this.story.lat) ||
      isNaN(this.story.lon)
    ) {
      console.warn(
        "Koordinat cerita tidak valid, peta tidak akan ditampilkan."
      );
      const mapDiv = this.container.querySelector("#detailMap");
      if (mapDiv) mapDiv.style.display = "none";
      return;
    }

    this.map = L.map("detailMap").setView([this.story.lat, this.story.lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    L.marker([this.story.lat, this.story.lon]).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  // === BARU: Metode untuk memperbarui status tombol simpan/hapus offline ===
  updateOfflineStatus(isSaved) {
    this.isStorySavedOffline = isSaved;
    // Panggil render ulang untuk memperbarui tombol di template
    // Ini akan me-render ulang seluruh view, bisa jadi tidak optimal untuk perubahan kecil
    // Alternatif: hanya update elemen tombol secara langsung tanpa render ulang seluruh template
    this.render(this.container); // Render ulang untuk memperbarui teks tombol
  }

  showError(message) {
    const messageEl = this.container.querySelector("#message");
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.color = "red";
      messageEl.setAttribute("role", "alert");
      messageEl.setAttribute("aria-live", "assertive");
    }
  }

  showSuccess(message) {
    const messageEl = this.container.querySelector("#message");
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.color = "green";
      messageEl.setAttribute("role", "status");
      messageEl.setAttribute("aria-live", "polite");
    }
  }

  clearMessage() {
    const messageEl = this.container.querySelector("#message");
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.removeAttribute("role");
      messageEl.removeAttribute("aria-live");
    }
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    if (this.container) {
      // Hapus event listener secara spesifik jika diperlukan
      const backBtn = this.container.querySelector("#backBtn");
      if (backBtn) backBtn.removeEventListener("click", this.onBack); // Pastikan onBack tidak null

      const saveDeleteBtn =
        this.container.querySelector("#saveOfflineBtn") ||
        this.container.querySelector("#deleteOfflineBtn");
      if (saveDeleteBtn)
        saveDeleteBtn.removeEventListener("click", this._bindEvents); // Anda perlu menyimpan referensi fungsi terikat untuk menghapus listener ini.
      // Solusi sederhana untuk sekarang: bersihkan innerHTML saja.
      this.container.innerHTML = "";
    }
  }
}
