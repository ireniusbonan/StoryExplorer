import { openDB } from "idb";

const DB_NAME = "storyexplorer-db";
const DB_VERSION = 1;
const STORIES_STORE_NAME = "stories"; // Nama object store untuk cerita

export default class IndexedDbModel {
  constructor() {
    this.db = null;
    this._initDb();
  }

  async _initDb() {
    if (this.db) return; // Jika DB sudah terbuka, tidak perlu membuka lagi

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Buat object store 'stories' jika belum ada
        // KeyPath 'id' berarti setiap objek cerita harus memiliki properti 'id' yang unik
        // autoIncrement: false karena 'id' berasal dari API, bukan auto-generated lokal
        const storyStore = db.createObjectStore(STORIES_STORE_NAME, {
          keyPath: "id",
          autoIncrement: false,
        });
        // Opsional: Buat indeks jika Anda sering mencari berdasarkan properti lain (misal: 'createdAt')
        storyStore.createIndex("createdAt", "createdAt", { unique: false });
        console.log("IndexedDB upgraded: stories store created/upgraded.");
      },
      blocked() {
        console.warn(
          "IndexedDB blocked: Please close all other tabs of this app."
        );
      },
      blocking() {
        console.warn(
          "IndexedDB blocking: Database is being upgraded in another tab, please refresh."
        );
      },
      terminated() {
        console.error(
          "IndexedDB terminated: Database connection closed unexpectedly."
        );
      },
    });
    console.log("IndexedDB opened successfully.");
  }

  /**
   * Menyimpan atau memperbarui satu cerita di IndexedDB.
   * @param {object} story Data cerita yang akan disimpan
   */
  async putStory(story) {
    if (!this.db) await this._initDb();
    try {
      const tx = this.db.transaction(STORIES_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORIES_STORE_NAME);
      await store.put(story); // put() akan menambahkan atau memperbarui jika key (id) sudah ada
      await tx.done;
      console.log("Story saved/updated in IndexedDB:", story.id);
    } catch (error) {
      console.error("Failed to save story to IndexedDB:", error);
    }
  }

  /**
   * Menyimpan atau memperbarui banyak cerita di IndexedDB.
   * Menggunakan putAll untuk efisiensi transaksi.
   * @param {Array<object>} stories Array cerita yang akan disimpan
   */
  async putStories(stories) {
    if (!this.db) await this._initDb();
    if (!stories || stories.length === 0) return;

    try {
      const tx = this.db.transaction(STORIES_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORIES_STORE_NAME);
      await Promise.all(stories.map((story) => store.put(story)));
      await tx.done;
      console.log(`${stories.length} stories saved/updated in IndexedDB.`);
    } catch (error) {
      console.error("Failed to save multiple stories to IndexedDB:", error);
    }
  }

  /**
   * Mengambil satu cerita berdasarkan ID dari IndexedDB.
   * @param {string} id ID cerita
   * @returns {Promise<object|undefined>} Objek cerita atau undefined jika tidak ditemukan
   */
  async getStoryById(id) {
    if (!this.db) await this._initDb();
    try {
      const story = await this.db.get(STORIES_STORE_NAME, id);
      console.log("Fetched story from IndexedDB:", story);
      return story;
    } catch (error) {
      console.error("Failed to get story from IndexedDB:", error);
      return undefined;
    }
  }

  /**
   * Mengambil semua cerita dari IndexedDB.
   * @returns {Promise<Array<object>>} Array cerita
   */
  async getStories() {
    if (!this.db) await this._initDb();
    try {
      const stories = await this.db.getAll(STORIES_STORE_NAME);
      console.log(`Fetched ${stories.length} stories from IndexedDB.`);
      return stories;
    } catch (error) {
      console.error("Failed to get all stories from IndexedDB:", error);
      return [];
    }
  }

  /**
   * Menghapus satu cerita berdasarkan ID dari IndexedDB.
   * @param {string} id ID cerita yang akan dihapus
   */
  async deleteStory(id) {
    if (!this.db) await this._initDb();
    try {
      const tx = this.db.transaction(STORIES_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORIES_STORE_NAME);
      await store.delete(id);
      await tx.done;
      console.log("Story deleted from IndexedDB:", id);
    } catch (error) {
      console.error("Failed to delete story from IndexedDB:", error);
    }
  }

  /**
   * Menghapus semua cerita dari IndexedDB.
   */
  async clearStories() {
    if (!this.db) await this._initDb();
    try {
      const tx = this.db.transaction(STORIES_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORIES_STORE_NAME);
      await store.clear();
      await tx.done;
      console.log("All stories cleared from IndexedDB.");
    } catch (error) {
      console.error("Failed to clear stories from IndexedDB:", error);
    }
  }
}
