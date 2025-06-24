// cache-helper.js - Utilitas caching tambahan (opsional, sebagian besar caching di Service Worker)

const CACHE_NAME_APP_SHELL = "storyexplorer-app-shell-v1"; // Nama cache untuk shell aplikasi
const CACHE_NAME_ASSETS = "storyexplorer-assets-v1"; // Nama cache untuk aset tambahan

/**
 * Fungsi untuk meng-cache aset tertentu secara manual (jika diperlukan dari sisi client).
 * Umumnya, precaching aset statis dilakukan oleh Service Worker (Workbox).
 * @param {Array<string>} urlsToCache Array URL yang ingin di-cache
 * @param {string} cacheName Nama cache untuk menyimpan aset
 */
export const addUrlsToCache = async (
  urlsToCache,
  cacheName = CACHE_NAME_ASSETS
) => {
  if (!("caches" in window)) {
    console.warn("Cache API not supported in this browser.");
    return;
  }
  try {
    const cache = await caches.open(cacheName);
    await cache.addAll(urlsToCache);
    console.log(
      `Successfully cached ${urlsToCache.length} URLs into ${cacheName}.`
    );
  } catch (error) {
    console.error(`Failed to cache URLs into ${cacheName}:`, error);
  }
};

/**
 * Fungsi untuk menghapus cache tertentu.
 * @param {string} cacheName Nama cache yang ingin dihapus
 */
export const deleteCache = async (cacheName) => {
  if (!("caches" in window)) {
    console.warn("Cache API not supported in this browser.");
    return;
  }
  try {
    await caches.delete(cacheName);
    console.log(`Cache ${cacheName} deleted successfully.`);
  } catch (error) {
    console.error(`Failed to delete cache ${cacheName}:`, error);
  }
};

/**
 * Mengambil respon dari cache jika ada, jika tidak, dari network.
 * Ini lebih merupakan contoh strategi caching sisi client.
 * Untuk PWA, strategi ini lebih baik diimplementasikan di Service Worker.
 * @param {RequestInfo} request Request atau URL yang ingin diambil.
 * @param {string} cacheName Nama cache yang akan dicari.
 * @returns {Promise<Response>} Promise yang resolve ke Response.
 */
export const cacheOrNetwork = async (request, cacheName = CACHE_NAME_ASHEL) => {
  if (!("caches" in window)) {
    console.warn("Cache API not supported for cacheOrNetwork.");
    return fetch(request); // Langsung fetch dari network jika tidak ada Cache API
  }
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log(`Serving ${request.url} from cache (${cacheName}).`);
      return cachedResponse;
    }

    console.log(`Fetching ${request.url} from network.`);
    const networkResponse = await fetch(request);
    // Hanya cache jika respons OK
    if (networkResponse.ok && networkResponse.type === "basic") {
      // 'basic' untuk request origin yang sama
      console.log(`Caching ${request.url} to ${cacheName}.`);
      cache.put(request, networkResponse.clone()); // Simpan clone karena response stream hanya bisa dibaca sekali
    }
    return networkResponse;
  } catch (error) {
    console.error(`Error in cacheOrNetwork for ${request.url}:`, error);
    // Mungkin return offline fallback response jika perlu
    return new Response("<h1>Offline content</h1>", {
      headers: { "Content-Type": "text/html" },
    });
  }
};

// Eksport nama cache juga jika diperlukan di tempat lain
export { CACHE_NAME_APP_SHELL, CACHE_NAME_ASSETS };
