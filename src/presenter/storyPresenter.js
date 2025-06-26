import StoryListView from "../view/storyListView.js";
import StoryDetailView from "../view/storyDetailView.js";
import StoryFormView from "../view/storyFormView.js";
import OfflineView from "../view/offlineView.js";

export default class StoryPresenter {
  /**
   * @param {object} storyModel - Instance model cerita (yang sekarang bisa berinteraksi dengan IndexedDB)
   * @param {HTMLElement} mainContainer - Container utama untuk render View
   */
  constructor(storyModel, mainContainer) {
    this.model = storyModel;
    this.mainContainer =
      mainContainer || document.getElementById("main-content");
    this.currentPhotoFile = null; // Ini adalah tempat state file foto disimpan
    this.currentView = null;

    this.navigateTo = this.navigateTo.bind(this);
  }

  async showStoryList() {
    this._destroyCurrentView();
    this.currentView = new StoryListView({
      onDetail: (id) => {
        this.showStoryDetail(id);
      },
    });
    this.currentView.render(this.mainContainer);

    try {
      // Model sekarang yang akan memutuskan apakah dari API atau IndexedDB
      const stories = await this.model.fetchStories();
      if (stories.length === 0) {
        this.currentView.showStoryLoadError(
          "Tidak ada cerita untuk ditampilkan."
        );
      } else {
        this.currentView.showStories(stories);
      }
    } catch (error) {
      console.error("Error in showStoryList:", error);
      this.showOfflineMessage(
        error.message ||
          "Gagal memuat cerita. Anda mungkin sedang offline atau tidak ada data yang tersimpan."
      );
    }
  }

  async showStoryDetail(id) {
    this._destroyCurrentView();
    // Di sini kita meneruskan callback onSaveOffline dan onDeleteOffline ke StoryDetailView
    this.currentView = new StoryDetailView({
      story: null,
      onBack: () => {
        this.showStoryList();
        location.hash = "#/stories";
      },
      // === BARU: Callback untuk menyimpan cerita ke IndexedDB dari aksi pengguna ===
      onSaveOffline: async (storyData) => {
        const success = await this.model.saveStoryToIndexedDB(storyData);
        if (success) {
          this.currentView.showSuccess(
            "Cerita berhasil disimpan secara offline!"
          );
        } else {
          this.currentView.showError("Gagal menyimpan cerita secara offline.");
        }
        // Setelah menyimpan, perbarui status tombol di View (opsional, tergantung implementasi)
        this.currentView.updateOfflineStatus(true);
      },
      // === BARU: Callback untuk menghapus cerita dari IndexedDB dari aksi pengguna ===
      onDeleteOffline: async (storyId) => {
        const success = await this.model.deleteStoryFromIndexedDB(storyId);
        if (success) {
          this.currentView.showSuccess(
            "Cerita berhasil dihapus dari penyimpanan offline!"
          );
        } else {
          this.currentView.showError(
            "Gagal menghapus cerita dari penyimpanan offline."
          );
        }
        // Setelah menghapus, perbarui status tombol di View
        this.currentView.updateOfflineStatus(false);
      },
    });
    this.currentView.render(this.mainContainer);

    try {
      const story = await this.model.fetchStoryById(id);
      if (!story) {
        this.currentView.showError(
          "Cerita tidak ditemukan atau tidak ada dalam cache offline."
        );
        return;
      }
      this.currentView.story = story;
      this.currentView.render(this.mainContainer);

      // Setelah cerita dimuat, cek apakah cerita sudah tersimpan offline untuk update UI View
      const isSavedOffline = await this.model.indexedDb.getStoryById(story.id);
      this.currentView.updateOfflineStatus(!!isSavedOffline); // Perbarui status tombol di View
    } catch (error) {
      console.error("Error in showStoryDetail:", error);
      this.showOfflineMessage(
        error.message ||
          "Gagal memuat detail cerita. Anda mungkin sedang offline atau data tidak tersedia."
      );
    }
  }

  showAddStoryForm() {
    this._destroyCurrentView();
    this.currentView = new StoryFormView({
      onSubmit: this.handleSubmit.bind(this),
      onCameraClick: this.handleCameraClick.bind(this),
      onFileChange: this.handleFileChange.bind(this),
    });
    this.currentView.render(this.mainContainer);
  }

  async handleSubmit({ description, latitude, longitude }) {
    if (!description || !latitude || !longitude) {
      this.currentView.showError(
        "Deskripsi, Latitude, dan Longitude wajib diisi!"
      );
      return;
    }

    if (!this.currentPhotoFile) {
      this.currentView.showError("Foto harus diunggah!");
      return;
    }

    try {
      await this.model.addStory({
        description,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        photoFile: this.currentPhotoFile,
      });
      this.currentView.showSuccess("Cerita berhasil dikirim!");
      this.currentPhotoFile = null;
      this.showStoryList();
      location.hash = "#/stories";
    } catch (error) {
      console.error("Error submitting story:", error);
      this.currentView.showError(
        error.message || "Gagal mengirim cerita. Pastikan Anda online."
      );
    }
  }

  async handleCameraClick() {
    if (this.currentView && this.currentView.startCamera) {
      await this.currentView.startCamera();
    }
  }

  async handleFileChange(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      this.currentView.showError("File harus berupa gambar!");
      return;
    }

    if (!this.currentView) return;

    try {
      const compressedFile = await this.currentView.compressImage(
        file,
        800,
        800,
        0.7
      );
      this.currentPhotoFile = compressedFile;
      this.currentView.showPreview(compressedFile);
    } catch (error) {
      this.currentView.showError("Gagal memproses gambar: " + error.message);
    }
  }

  navigateTo(hash) {
    if (hash.startsWith("#/detail/")) {
      const id = hash.split("#/detail/")[1];
      this.showStoryDetail(id);
    } else if (hash.startsWith("#/stories") || hash === "" || hash === "#") {
      this.showStoryList();
    } else if (hash.startsWith("#/add")) {
      this.showAddStoryForm();
    } else if (hash.startsWith("#/offline")) {
      this.showOfflineMessage(
        "Anda sedang offline atau terjadi masalah jaringan."
      );
    } else {
      this.showStoryList();
    }
  }

  showOfflineMessage(message) {
    this._destroyCurrentView();
    this.currentView = new OfflineView({ message: message });
    this.currentView.render(this.mainContainer);
  }

  _destroyCurrentView() {
    if (this.currentView && this.currentView.destroy) {
      this.currentView.destroy();
    }
    this.currentView = null;
    this.currentPhotoFile = null;
  }
}
