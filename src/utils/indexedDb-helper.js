import { openDB } from "idb";

const DB_NAME = "storyexplorer-db";
const DB_VERSION = 1;
const STORIES_STORE_NAME = "stories";

/**
 * Membuka koneksi ke IndexedDB dan menginisialisasi object stores jika diperlukan.
 * @returns {Promise<IDBDatabase>} Instance database IndexedDB.
 */
const initIndexedDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Ini akan dipanggil hanya jika versi database lebih tinggi
        // dari versi yang sudah ada di browser pengguna.
        // Ini adalah tempat untuk membuat atau memodifikasi object stores.

        if (!database.objectStoreNames.contains(STORIES_STORE_NAME)) {
          console.log(`Creating object store: ${STORIES_STORE_NAME}`);
          // Buat object store 'stories'
          // keyPath 'id' berarti setiap objek harus memiliki properti 'id' yang unik sebagai kunci
          // autoIncrement: false karena ID akan disediakan dari API
          const storiesStore = database.createObjectStore(STORIES_STORE_NAME, {
            keyPath: "id",
            autoIncrement: false,
          });
          // Buat indeks 'createdAt' untuk pencarian atau pengurutan berdasarkan tanggal
          storiesStore.createIndex("createdAt", "createdAt", { unique: false });
          console.log(
            `IndexedDB: ${STORIES_STORE_NAME} store and 'createdAt' index created.`
          );
        }
      },
      blocked() {
        console.warn(
          "IndexedDB: Database upgrade blocked. Please close all other tabs of this app."
        );
        alert(
          "Database sedang diupgrade. Mohon tutup semua tab aplikasi ini dan coba lagi."
        );
      },
      blocking() {
        console.warn(
          "IndexedDB: Database is being upgraded in another tab. Please refresh."
        );
        alert("Aplikasi sedang diperbarui. Mohon muat ulang halaman.");
      },
      terminated() {
        console.error(
          "IndexedDB: Database connection terminated unexpectedly."
        );
        alert("Koneksi database terputus secara tidak terduga.");
      },
    });
    console.log("IndexedDB connection established.");
    return db;
  } catch (error) {
    console.error("Failed to open IndexedDB:", error);
    throw new Error(
      "Gagal membuka database lokal. Fitur offline mungkin tidak berfungsi."
    );
  }
};

export { initIndexedDB, DB_NAME, DB_VERSION, STORIES_STORE_NAME };
