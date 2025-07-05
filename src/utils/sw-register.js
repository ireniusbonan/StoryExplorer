// // src/utils/sw-register.js

// export default async function swRegister() {
//   if ("serviceWorker" in navigator) {
//     try {
//       // Pendaftaran ini HANYA BERLAKU jika kamu pakai injectManifest
//       const registration = await navigator.serviceWorker.register(
//         "/StoryExplorer/registerSW.js"
//       );
//       console.log("✅ Service Worker berhasil didaftarkan:", registration);
//     } catch (error) {
//       console.error("❌ Gagal mendaftarkan Service Worker:", error);
//     }
//   } else {
//     console.warn("❌ Browser tidak mendukung Service Worker.");
//   }
// }
