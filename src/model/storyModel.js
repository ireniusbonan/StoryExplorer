const STORY_API_BASE = "https://story-api.dicoding.dev/v1";

export default class StoryModel {
  constructor(indexedDbModel = null) {
    this.indexedDb = indexedDbModel;
  }

  async fetchStories() {
    const token = localStorage.getItem("token");
    if (!token) {
      if (this.indexedDb) {
        console.log("Fetching stories from IndexedDB (no token)");
        return await this.indexedDb.getStories();
      }
      throw new Error("Anda harus login atau sedang offline.");
    }

    try {
      const response = await fetch(`${STORY_API_BASE}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        console.warn(
          "Gagal fetch dari API, fallback ke IndexedDB:",
          data.message
        );
        if (this.indexedDb) return await this.indexedDb.getStories();
        throw new Error(data.message || "Gagal mengambil cerita dari API.");
      }

      return data.listStory || [];
    } catch (error) {
      console.error("Error fetchStories:", error.message);
      if (this.indexedDb) {
        console.log("Fallback ke IndexedDB karena error API");
        return await this.indexedDb.getStories();
      }
      throw new Error(
        error.message || "Gagal mengambil cerita. Periksa koneksi."
      );
    }
  }

  async fetchStoryById(id) {
    const token = localStorage.getItem("token");
    if (!token) {
      if (this.indexedDb) {
        console.log(`Fetching story ${id} dari IndexedDB (no token)`);
        return await this.indexedDb.getStoryById(id);
      }
      throw new Error("Anda harus login atau sedang offline.");
    }

    try {
      const response = await fetch(`${STORY_API_BASE}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        console.warn(`Gagal fetch story ${id} dari API, fallback ke IndexedDB`);
        if (this.indexedDb) return await this.indexedDb.getStoryById(id);
        throw new Error(data.message || "Gagal mengambil detail cerita.");
      }

      return data.story || null;
    } catch (error) {
      console.error(`Error fetchStoryById(${id}):`, error.message);
      if (this.indexedDb) {
        return await this.indexedDb.getStoryById(id);
      }
      throw new Error(error.message || "Gagal mengambil detail cerita.");
    }
  }

  async addStory({ description, lat, lon, photoFile }) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Anda harus login untuk menambah cerita.");

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
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menambah cerita.");
      return data;
    } catch (error) {
      console.error("Error addStory:", error.message);
      throw new Error(error.message || "Gagal menambah cerita.");
    }
  }

  /**
   * Simpan cerita manual ke IndexedDB (dipicu pengguna).
   * @param {object} story - Data cerita
   * @returns {Promise<boolean>}
   */
  async saveStoryToIndexedDB(story) {
    if (this.indexedDb && story) {
      try {
        await this.indexedDb.putStory(story);
        console.log("Story saved manually to IndexedDB:", story.id);
        return true;
      } catch (error) {
        console.error("Failed to save to IndexedDB:", error.message);
        return false;
      }
    }
    console.warn("IndexedDB tidak tersedia atau data tidak valid.");
    return false;
  }

  /**
   * Hapus cerita dari IndexedDB berdasarkan ID (dipicu pengguna).
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async deleteStoryFromIndexedDB(id) {
    if (this.indexedDb && id) {
      try {
        await this.indexedDb.deleteStory(id);
        console.log("Story deleted from IndexedDB:", id);
        return true;
      } catch (error) {
        console.error("Failed to delete from IndexedDB:", error.message);
        return false;
      }
    }
    console.warn("IndexedDB tidak tersedia atau ID tidak valid.");
    return false;
  }
}
