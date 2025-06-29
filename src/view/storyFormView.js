import L from "leaflet";

export default class StoryFormView {
  constructor({ onSubmit, onCameraClick, onFileChange }) {
    this.onSubmit = onSubmit;
    this.onCameraClick = onCameraClick;
    this.onFileChange = onFileChange;
    this.map = null;
    this.marker = null;
    this.stream = null; // Untuk stream kamera (MediaStream object)
    this.video = null; // Untuk elemen video preview kamera
    this.container = null;
    this._capturePhotoHandler = null; // Untuk menyimpan referensi handler klik video
    this._beforeUnloadHandler = null; // Untuk menyimpan referensi handler beforeunload
  }

  getTemplate() {
    return `
      <section class="form-section" aria-labelledby="form-title">
        <h2 id="form-title">➕ Tambahkan Cerita Baru</h2>
        <form id="storyForm" autocomplete="off" aria-describedby="form-note">
          <fieldset>
            <legend>📍 Pilih Lokasi <span aria-hidden="true">*</span></legend>
            <div id="map" style="height:220px; border-radius:12px; margin-bottom:8px;" aria-label="Peta interaktif untuk memilih lokasi cerita"></div>
            <small>Klik peta untuk menentukan lokasi Anda</small>
            <div class="latlng-inputs">
              <label for="latitude">Lat:</label>
              <input type="text" id="latitude" name="latitude" readonly required aria-required="true" aria-label="Latitude lokasi cerita" />
              <label for="longitude">Lng:</label>
              <input type="text" id="longitude" name="longitude" readonly required aria-required="true" aria-label="Longitude lokasi cerita" />
            </div>
          </fieldset>

          <fieldset>
            <legend>📝 Ceritakan Pengalaman Anda <span aria-hidden="true">*</span></legend>
            <textarea id="description" name="description" rows="4" required aria-required="true" placeholder="Tuliskan pengalaman Anda..."></textarea>
          </fieldset>

          <fieldset>
            <legend>📷 Unggah Foto <span aria-hidden="true">*</span></legend>
            <div class="upload-section">
              <button type="button" id="openCamera" class="upload-btn" aria-label="Ambil gambar dari kamera">Ambil Gambar</button>
              <span>atau</span>
              <label for="fileInput" class="upload-label" aria-label="Pilih foto dari perangkat">Pilih Foto</label>
              <input type="file" id="fileInput" accept="image/*" hidden aria-hidden="true" />
              <div id="preview" aria-live="polite" aria-label="Pratinjau gambar atau pesan status"></div>
            </div>
          </fieldset>

          <div id="form-message" role="status" aria-live="polite" style="margin-bottom: 12px;"></div>
          <button type="submit" class="submit-btn" aria-label="Kirim cerita baru Anda">Kirim Cerita Anda</button>
          <small id="form-note" class="form-note">* Kolom ini wajib diisi</small>
        </form>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._bindEvents();
    this._initMap();

    // === PERBAIKAN: Pastikan handler beforeunload terikat sekali dan dapat dilepas ===
    // Selalu bind ulang handler ini ke instance saat ini untuk memastikan referensi yang benar saat destroy
    this._beforeUnloadHandler = this.stopCamera.bind(this);
    window.addEventListener("beforeunload", this._beforeUnloadHandler);
  }

  _bindEvents() {
    const form = this.container.querySelector("#storyForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        this.showError("Mohon lengkapi semua kolom yang wajib diisi.");
        return;
      }

      // Validasi photoFile dilakukan di Presenter

      const formData = new FormData(form);
      this.clearMessage();
      this.onSubmit({
        description: formData.get("description"),
        latitude: formData.get("latitude"),
        longitude: formData.get("longitude"),
      });
    });

    this.container
      .querySelector("#openCamera")
      .addEventListener("click", () => {
        this.onCameraClick();
      });

    this.container
      .querySelector("#fileInput")
      .addEventListener("change", (e) => {
        if (e.target.files[0]) {
          this.onFileChange(e.target.files[0]);
        }
      });
  }

  _initMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
    this.map = L.map("map").setView([-2.5489, 118.0149], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.marker.bindPopup("Lokasi dipilih").openPopup();
      this.setLatLng(lat, lng);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  setLatLng(lat, lng) {
    this.container.querySelector("#latitude").value = lat.toFixed(6);
    this.container.querySelector("#longitude").value = lng.toFixed(6);
  }

  showPreview(fileOrBlob) {
    this.clearMessage();
    const url = URL.createObjectURL(fileOrBlob);
    const preview = this.container.querySelector("#preview");
    preview.innerHTML = `<img src="${url}" alt="Pratinjau Foto Cerita" style="max-width:120px; border-radius:12px; margin-top:0.5rem; cursor:pointer; box-shadow:0 2px 6px rgb(0 0 0 / 0.15);" />`;
    const imgEl = preview.querySelector("img");
    imgEl.onload = () => URL.revokeObjectURL(url);
    imgEl.onerror = () => {
      URL.revokeObjectURL(url);
      this.showError("Gagal memuat pratinjau gambar.");
    };
  }

  showError(message) {
    const messageEl = this.container.querySelector("#form-message");
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.color = "red";
      messageEl.setAttribute("role", "alert");
      messageEl.setAttribute("aria-live", "assertive");
    }
  }

  showSuccess(message) {
    const messageEl = this.container.querySelector("#form-message");
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.style.color = "green";
      messageEl.setAttribute("role", "status");
      messageEl.setAttribute("aria-live", "polite");
    }
  }

  clearMessage() {
    const messageEl = this.container.querySelector("#form-message");
    if (messageEl) {
      messageEl.textContent = "";
      messageEl.removeAttribute("role");
      messageEl.removeAttribute("aria-live");
    }
    const previewEl = this.container.querySelector("#preview");
    if (previewEl) {
      previewEl.innerHTML = "";
    }
  }

  navigateTo(hash) {
    location.hash = hash;
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.showError("Kamera tidak didukung di browser ini.");
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video = document.createElement("video");
      this.video.autoplay = true;
      this.video.srcObject = this.stream;
      this.video.style.maxWidth = "240px";
      this.video.style.borderRadius = "12px";
      this.video.setAttribute("aria-label", "Pratinjau Kamera");

      const preview = this.container.querySelector("#preview");
      preview.innerHTML = "";
      preview.appendChild(this.video);

      if (!this._capturePhotoHandler) {
        // === PERBAIKAN: Bind _capturePhotoHandler di sini ===
        this._capturePhotoHandler = this._capturePhoto.bind(this);
      }
      this.video.addEventListener("click", this._capturePhotoHandler);
      this.showSuccess("Ketuk pratinjau kamera untuk mengambil foto.");
    } catch (error) {
      this.showError("Gagal mengakses kamera: " + error.message);
    }
  }

  async _capturePhoto() {
    if (!this.video) {
      this.showError("Kamera tidak aktif.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(this.video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        // === PERBAIKAN: Mematikan kamera segera setelah pengambilan foto ===
        this.stopCamera();
        // =========================================================

        try {
          const compressed = await this.compressImage(blob, 800, 800, 0.7);
          this.onFileChange(compressed); // Kirimkan file foto yang sudah dikompresi ke Presenter
          this.showPreview(compressed);
          this.showSuccess("Foto berhasil diambil dan dikompresi.");
        } catch (error) {
          this.showError("Gagal memproses gambar kamera: " + error.message);
        }
      },
      "image/jpeg",
      0.9
    );
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop()); // Menghentikan semua track media di stream
      this.stream = null;
    }
    if (this.video) {
      // === PERBAIKAN: Hapus event listener dengan referensi yang benar ===
      if (this._capturePhotoHandler) {
        // Hanya hapus jika handler sudah di-bind
        this.video.removeEventListener("click", this._capturePhotoHandler);
      }
      this.video.pause();
      this.video.srcObject = null; // Memutuskan sumber video
      this.video.remove(); // Menghapus elemen video dari DOM
      this.video = null;
    }
  }

  compressImage(fileOrBlob, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Gagal mengompres gambar: Blob kosong"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () =>
        reject(new Error("Gagal memuat gambar untuk kompresi."));
      reader.onerror = () =>
        reject(new Error("Gagal membaca file gambar untuk kompresi."));

      if (fileOrBlob instanceof Blob) {
        reader.readAsDataURL(fileOrBlob);
      } else {
        reject(new Error("Input compressImage harus berupa File atau Blob."));
      }
    });
  }

  destroy() {
    this.stopCamera(); // Pastikan kamera dihentikan saat view dihancurkan
    if (this.map) {
      this.map.remove(); // Hancurkan instance peta Leaflet
      this.map = null;
      this.marker = null;
    }
    if (this.container) {
      // === PERBAIKAN: Hapus event listener global window.beforeunload dengan referensi yang benar ===
      if (this._beforeUnloadHandler) {
        // Hanya hapus jika handler sudah di-bind
        window.removeEventListener("beforeunload", this._beforeUnloadHandler);
      }
      // =========================================================================================
      this.container.innerHTML = ""; // Kosongkan container DOM
    }
  }
}
