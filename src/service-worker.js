/* eslint-disable no-undef */
import { precacheAndRoute } from "workbox-precaching";

// ✅ Inject manifest (W A J I B) — Workbox akan isi array __WB_MANIFEST secara otomatis saat build
precacheAndRoute(self.__WB_MANIFEST);

// ✅ Install: Langsung aktifkan SW (tanpa tunggu page reload)
self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

// ✅ Activate: Claim kontrol semua tab (tanpa reload)
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  clients.claim();
});

// ✅ Push Notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  // Default data jika tidak ada payload
  const defaultData = {
    title: "Notifikasi Default",
    options: {
      body: "Ini notifikasi dari Service Worker",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: { url: "/" }, // default redirect saat diklik
    },
  };

  let data = defaultData;

  try {
    if (event.data) {
      const jsonData = event.data.json();
      data = {
        title: jsonData.title || defaultData.title,
        options: {
          ...defaultData.options,
          ...jsonData.options,
        },
      };
    }
  } catch (e) {
    console.warn("[SW] Payload bukan JSON, gunakan default notifikasi");
  }

  event.waitUntil(self.registration.showNotification(data.title, data.options));
});

// ✅ Klik notifikasi: buka atau fokus tab utama
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
