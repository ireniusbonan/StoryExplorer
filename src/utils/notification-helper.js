// GANTI DENGAN VAPID PUBLIC KEY DARI DICODING API ATAU YANG ANDA GENERATE SENDIRI
// Contoh: const VAPID_PUBLIC_KEY = "BPm_k-c8d45E7l3d...";
// Anda dapat menemukan VAPID public key di dokumentasi API Dicoding
// atau generate sendiri menggunakan web-push library (npm install web-push)
// web-push generate-vapid-keys --json
const VAPID_PUBLIC_KEY = "YOUR_VAPID_PUBLIC_KEY_HERE"; // <--- GANTI INI!

// Fungsi utilitas untuk mengubah string VAPID public key menjadi Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Meminta izin notifikasi dari pengguna.
 * @returns {Promise<NotificationPermission>} 'granted', 'denied', atau 'default'
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Browser tidak mendukung Notification API.");
    return "denied"; // Atau semacam indikator tidak didukung
  }

  const permission = await Notification.requestPermission();
  console.log("Izin Notifikasi:", permission);
  return permission;
};

/**
 * Berlangganan (subscribe) ke Push Notification.
 * Ini akan mendapatkan PushSubscription dari browser dan mengirimkannya ke API.
 * @returns {Promise<PushSubscription|null>} Objek PushSubscription jika berhasil, null jika gagal
 */
export const subscribePushNotification = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push Notification tidak didukung di browser ini.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // Jika belum berlangganan, buat langganan baru
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Notifikasi harus selalu terlihat oleh pengguna
        applicationServerKey: convertedVapidKey,
      });
      console.log("Push Subscription baru dibuat:", subscription);

      // KIRIM SUBSCRIPTION KE BACKEND API ANDA
      // Ini adalah bagian KRUSIAL: Anda harus mengirim 'subscription' ini ke server Anda
      // Server kemudian akan menyimpan subscription ini untuk mengirim push notifikasi nanti
      // Contoh (sesuaikan dengan endpoint API Anda):
      const API_ENDPOINT = "https://story-api.dicoding.dev/v1/subscriptions"; // Contoh endpoint
      const token = localStorage.getItem("token"); // Asumsikan Anda butuh token untuk otentikasi API
      if (!token) {
        console.error(
          "Tidak ada token autentikasi untuk mengirim subscription."
        );
        // Anda mungkin ingin menghapus subscription jika tidak bisa dikirim
        await subscription.unsubscribe();
        return null;
      }

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        console.log("Push Subscription berhasil dikirim ke backend.");
      } else {
        const errorData = await response.json();
        console.error(
          "Gagal mengirim Push Subscription ke backend:",
          errorData.message
        );
        // Jika gagal mengirim ke backend, mungkin lebih baik unsubscribe agar tidak ada langganan 'zombie'
        await subscription.unsubscribe();
        return null;
      }
    } else {
      console.log("Sudah ada Push Subscription:", subscription);
    }

    return subscription;
  } catch (error) {
    console.error("Gagal berlangganan Push Notification:", error);
    // Jika user menolak permission atau ada error lain
    if (Notification.permission === "denied") {
      console.warn("Pengguna menolak izin notifikasi.");
    }
    return null;
  }
};

// Fungsi opsional untuk meng-unsubscribe (misal saat logout)
export const unsubscribePushNotification = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push Notification tidak didukung di browser ini.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log("Successfully unsubscribed from push notifications.");

      // OPSI: KIRIM KE BACKEND UNTUK MENGHAPUS SUBSCRIPTION
      // Ini penting jika Anda menyimpan subscription di server
      // Contoh:
      // const API_ENDPOINT = 'https://story-api.dicoding.dev/v1/unsubscribe';
      // const token = localStorage.getItem('token');
      // if (token) {
      //   await fetch(API_ENDPOINT, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       'Authorization': `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ endpoint: subscription.endpoint }), // Kirim endpoint atau ID yang digunakan server
      //   });
      // }
    } else {
      console.log("Tidak ada push subscription aktif.");
    }
  } catch (error) {
    console.error("Gagal meng-unsubscribe push notification:", error);
  }
};
