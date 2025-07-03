// src/utils/pushSubscription.js

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const API_ENDPOINT =
  "https://story-api.dicoding.dev/v1/notifications/subscribe";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeUserToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Browser tidak mendukung push notification.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log("✅ Subscribed to Push:", subscription);

    // Kirim subscription ke server
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan subscription ke server.");
    }

    alert("🔔 Notifikasi berhasil diaktifkan!");
    return subscription;
  } catch (error) {
    console.error("❌ Gagal subscribe:", error);
    alert("Gagal mengaktifkan notifikasi.");
  }
}

export async function unsubscribeUserFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("🔕 Notifikasi dinonaktifkan.");
      alert("🔕 Notifikasi berhasil dinonaktifkan!");
    } else {
      alert("Tidak ada langganan notifikasi aktif.");
    }
  } catch (error) {
    console.error("❌ Gagal unsubscribe:", error);
    alert("Gagal menonaktifkan notifikasi.");
  }
}

export async function isUserSubscribed() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
