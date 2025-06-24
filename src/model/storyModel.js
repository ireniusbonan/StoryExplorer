const STORY_API_BASE = "https://story-api.dicoding.dev/v1";

export default class StoryModel {
  // Constructor bisa menerima instance IndexedDbModel di sini
  // agar StoryModel bisa decide kapan pakai API, kapan pakai IndexedDB
  constructor(indexedDbModel = null) {
    this.indexedDb = indexedDbModel;
  }

  async fetchStories() {
    const token = localStorage.getItem("token");
    if (!token) {
      // Jika tidak ada token, coba ambil dari IndexedDB jika tersedia
      if (this.indexedDb) {
        console.log("Fetching stories from IndexedDB (no token available)");
        return await this.indexedDb.getStories();
      }
      throw new Error(
        "Anda harus login untuk melihat cerita atau aplikasi offline."
      );
    }

    try {
      const response = await fetch(`${STORY_API_BASE}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        // Jika respons API tidak OK, coba ambil dari IndexedDB
        if (this.indexedDb) {
          console.error(
            "Failed to fetch from API, trying IndexedDB:",
            data.message
          );
          return await this.indexedDb.getStories();
        }
        throw new Error(data.message || "Gagal mengambil cerita dari API.");
      }

      const stories = data.listStory || [];
      // Simpan cerita yang berhasil diambil dari API ke IndexedDB
      if (this.indexedDb && stories.length > 0) {
        await this.indexedDb.putStories(stories);
      }
      return stories;
    } catch (error) {
      console.error("Error fetching stories from API:", error.message);
      // Jika gagal dari API (misal, masalah jaringan), coba ambil dari IndexedDB
      if (this.indexedDb) {
        console.log("Fetching stories from IndexedDB (API failed)");
        return await this.indexedDb.getStories();
      }
      throw new Error(
        error.message ||
          "Gagal mengambil cerita. Periksa koneksi internet Anda."
      );
    }
  }

  async fetchStoryById(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      // Jika tidak ada token, coba ambil dari IndexedDB
      if (this.indexedDb) {
        console.log(`Fetching story ${id} from IndexedDB (no token available)`);
        return await this.indexedDb.getStoryById(id);
      }
      throw new Error(
        "Anda harus login untuk melihat detail cerita atau aplikasi offline."
      );
    }

    try {
      const response = await fetch(`${STORY_API_BASE}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        // Jika respons API tidak OK, coba ambil dari IndexedDB
        if (this.indexedDb) {
          console.error(
            `Failed to fetch story ${id} from API, trying IndexedDB:`,
            data.message
          );
          return await this.indexedDb.getStoryById(id);
        }
        throw new Error(
          data.message || "Gagal mengambil detail cerita dari API."
        );
      }
      const story = data.story || null;
      // Simpan cerita yang berhasil diambil dari API ke IndexedDB
      if (this.indexedDb && story) {
        await this.indexedDb.putStory(story);
      }
      return story;
    } catch (error) {
      console.error(`Error fetching story ${id} from API:`, error.message);
      // Jika gagal dari API, coba ambil dari IndexedDB
      if (this.indexedDb) {
        console.log(`Fetching story ${id} from IndexedDB (API failed)`);
        return await this.indexedDb.getStoryById(id);
      }
      throw new Error(
        error.message ||
          "Gagal mengambil detail cerita. Periksa koneksi internet Anda."
      );
    }
  }

  async addStory({ description, lat, lon, photoFile }) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Anda harus login untuk menambah cerita");

    const formData = new FormData();
    formData.append("description", description);
    formData.append("lat", lat);
    formData.append("lon", lon);
    formData.append("photo", photoFile);

    try {
      const response = await fetch(`${STORY_API_BASE}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Penting: Content-Type TIDAK perlu disetel saat menggunakan FormData,
          // browser akan mengaturnya secara otomatis dengan boundary yang benar.
          // Menyetelnya secara manual bisa merusak upload file.
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menambah cerita");
      return data;
    } catch (error) {
      console.error("Error adding story:", error);
      // Di sini Anda mungkin ingin menyimpan cerita ke IndexedDB sebagai "pending"
      // jika ada kebutuhan untuk sinkronisasi offline-first.
      // Namun, untuk kriteria saat ini, cukup lempar error.
      throw new Error(
        error.message || "Gagal menambah cerita. Periksa koneksi internet Anda."
      );
    }
  }
}
