import { precacheAndRoute } from "workbox-precaching";

// Inject manifest (W A J I B)
precacheAndRoute(self.__WB_MANIFEST);

// Pasang service worker segera
self.addEventListener("install", (event) => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  clients.claim();
});

// Push notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  const defaultData = {
    title: "Notifikasi Default",
    options: {
      body: "Ini notifikasi dari Service Worker",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
    },
  };

  let data = defaultData;

  try {
    if (event.data) {
      const jsonData = event.data.json();
      data = {
        title: jsonData.title || defaultData.title,
        options: { ...defaultData.options, ...jsonData.options },
      };
    }
  } catch (e) {
    console.warn("[SW] Push payload bukan JSON");
  }

  event.waitUntil(self.registration.showNotification(data.title, data.options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});
