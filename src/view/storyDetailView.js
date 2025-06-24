import L from "leaflet"; // Pastikan Leaflet diimpor jika digunakan di sini

export default class StoryDetailView {
  constructor({ story }) {
    this.story = story || null;
    this.container = null;
    this.map = null;
    this.onBack = null; // Callback saat tombol kembali diklik
  }

  getTemplate() {
    if (!this.story) {
      // Menampilkan pesan loading atau placeholder jika data cerita belum ada
      return `<section aria-live="polite" aria-label="Memuat detail cerita"><p>Memuat data cerita...</p></section>`;
    }

    // Template untuk menampilkan detail cerita
    return `
      <section aria-label="Detail cerita">
        <button id="backBtn" aria-label="Kembali ke daftar cerita" style="margin-bottom:12px; cursor:pointer;">
          ← Kembali
        </button>
        <h2>${this.story.name || "Anonim"}</h2>
        <img
          src="${this.story.photoUrl || this.story.photo}"
          alt="Foto cerita dari ${this.story.name || "Anonim"}"
          style="max-width:100%; border-radius:12px; margin-bottom:12px;"
        />
        <p>${this.story.description}</p>
        <p><strong>Latitude:</strong> ${this.story.lat}</p>
        <p><strong>Longitude:</strong> ${this.story.lon}</p>
        <div id="detailMap" style="height: 300px; border-radius: 12px;" aria-label="Peta lokasi cerita"></div>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._initMap(); // Inisialisasi peta setelah template dirender
    this._bindEvents(); // Ikatan event setelah elemen DOM tersedia
  }

  _bindEvents() {
    const backBtn = this.container.querySelector("#backBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (this.onBack) this.onBack(); // Panggil callback 'onBack' yang disediakan oleh Presenter
      });
    }
  }

  _initMap() {
    // Pastikan peta sebelumnya dihancurkan jika ada
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Jangan inisialisasi peta jika data cerita atau koordinat tidak valid
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
      // Opsional: tampilkan pesan placeholder atau sembunyikan div peta
      const mapDiv = this.container.querySelector("#detailMap");
      if (mapDiv) mapDiv.style.display = "none"; // Sembunyikan div peta
      return;
    }

    this.map = L.map("detailMap").setView([this.story.lat, this.story.lon], 13); // Set view ke lokasi cerita

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    L.marker([this.story.lat, this.story.lon]).addTo(this.map); // Tambahkan marker di lokasi cerita

    // Penting: Invalidate size setelah DOM dirender untuk memastikan peta ditampilkan dengan benar
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  showError(message) {
    if (this.container) {
      // Menampilkan pesan error di dalam container utama view ini
      this.container.innerHTML = `<p style="color:red; text-align:center;" role="alert" aria-live="assertive">${message}</p>`;
    }
  }

  // Metode showSuccess dan clearMessage tidak relevan untuk view ini,
  // tapi destroy tetap penting untuk cleanup.
  destroy() {
    // Hancurkan instance peta Leaflet untuk mencegah memory leak
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    // Kosongkan container DOM untuk view ini
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}
