import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Menghilangkan cache yang ketinggalan dari versi Service Worker sebelumnya
cleanupOutdatedCaches();

// Precache daftar aset yang ditentukan oleh Vite (akan diinjeksikan secara otomatis)
// Contoh: precacheAndRoute(self.__WB_MANIFEST || []);
// self.__WB_MANIFEST akan diisi oleh Workbox InjectManifest plugin di Vite
precacheAndRoute(self.__WB_MANIFEST || []);

// Konfigurasi nama-nama cache
const CACHE_NAME = "storyexplorer-v1";
const API_CACHE_NAME = "storyexplorer-api-v1";
const IMAGE_CACHE_NAME = "storyexplorer-images-v1";

// Mengatur strategi caching untuk API Stories
registerRoute(
  ({ url }) => url.href.startsWith("https://story-api.dicoding.dev/v1/stories"),
  new NetworkFirst({
    cacheName: API_CACHE_NAME,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache respons berhasil atau respons CORS Opaque
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 7, // Cache selama 1 minggu
        maxEntries: 50, // Maksimal 50 entri API
      }),
    ],
  })
);

// Mengatur strategi caching untuk API Autentikasi (tidak perlu di-cache jika sensitif)
// registerRoute(
//   ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1/login') ||
//                url.href.startsWith('https://story-api.dicoding.dev/v1/register'),
//   new NetworkOnly() // Selalu ambil dari jaringan untuk login/register
// );

// Mengatur strategi caching untuk gambar
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: IMAGE_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60, // Maksimal 60 gambar
        maxAgeSeconds: 60 * 60 * 24 * 30, // Cache selama 30 hari
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache respons berhasil atau respons CORS Opaque
      }),
    ],
  })
);

// Mengatur strategi caching untuk Google Fonts (jika digunakan)
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // Cache selama 1 tahun
        maxEntries: 30,
      }),
    ],
  })
);

// --- Push Notification Handling ---

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title || "StoryExplorer Notification";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru.",
    icon: data.icon || "/icons/icon-192x192.png", // Default icon
    image: data.image || undefined, // Gambar notifikasi
    data: {
      url: data.url || "/", // URL yang akan dibuka saat notifikasi diklik
    },
    actions: data.actions || [], // Aksi untuk notifikasi (opsional)
    badge: "/icons/badge.png", // Badge icon (opsional)
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickedNotification = event.notification;
  const urlToOpen = clickedNotification.data.url;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Jika ada jendela aplikasi yang sudah terbuka, fokus ke sana
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika tidak ada jendela yang cocok, buka jendela baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});

// --- Lifecycle events (Optional, for advanced control) ---
// self.addEventListener('install', (event) => {
//   console.log('Service Worker: Installed');
//   self.skipWaiting(); // Memaksa SW baru untuk segera aktif
// });

// self.addEventListener('activate', (event) => {
//   console.log('Service Worker: Activated');
//   event.waitUntil(clients.claim()); // Mengklaim semua klien yang ada
// });
