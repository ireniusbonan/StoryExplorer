/* eslint-disable no-undef */
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// ✅ 1. Precache semua file hasil build
precacheAndRoute(self.__WB_MANIFEST);

// ✅ 2. Install langsung aktif
self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

// ✅ 3. Aktif langsung klaim tab
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  clients.claim();
});

// ✅ 4. Caching gambar (CDN/local image)
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "image-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 hari
      }),
    ],
  })
);

// ✅ 5. Caching tile peta (Leaflet / OpenStreetMap / Unpkg)
registerRoute(
  ({ url }) =>
    url.origin.includes("tile.openstreetmap.org") ||
    url.origin.includes("unpkg.com"),
  new StaleWhileRevalidate({
    cacheName: "leaflet-tiles",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 14 * 24 * 60 * 60, // 2 minggu
      }),
    ],
  })
);

// ✅ 6. Caching GET API cerita
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/v1/stories") && request.method === "GET",
  new StaleWhileRevalidate({
    cacheName: "story-api-cache",
  })
);

// ✅ 7. Fallback offline page (opsional, jika disediakan)
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
  }
});

// ✅ 8. Handle push notifikasi
self.addEventListener("push", (event) => {
  console.log("[SW] Push Received");

  const defaultData = {
    title: "Notifikasi Story Explorer",
    options: {
      body: "Ada pembaruan cerita terbaru.",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [200, 100, 200],
      data: { url: "/StoryExplorer/#/stories" },
    },
  };

  let data = defaultData;

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || defaultData.title,
        options: {
          ...defaultData.options,
          ...payload.options,
        },
      };
    }
  } catch (e) {
    console.warn("[SW] Push payload bukan JSON, gunakan default");
  }

  event.waitUntil(self.registration.showNotification(data.title, data.options));
});

// ✅ 9. Saat notifikasi diklik, buka tab atau window
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/StoryExplorer/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        const matchingClient = clientsArr.find((client) =>
          client.url.includes(urlToOpen)
        );
        if (matchingClient) {
          return matchingClient.focus();
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
