import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa"; // PENTING: Impor plugin VitePWA

export default defineConfig({
  // Atur base path aplikasi. '/' adalah default untuk root domain hosting seperti Netlify.
  // Ganti ke '/nama-repo-anda/' jika deploy ke GitHub Pages atau subpath lain.
  base: "/",

  server: {
    port: 3000, // Port development server
    open: true, // Buka browser otomatis saat dev server jalan
    host: true, // Agar bisa diakses dari LAN jika perlu
  },
  build: {
    outDir: "dist", // Folder hasil build produksi
    sourcemap: true, // Aktifkan source map untuk debugging
  },
  resolve: {
    alias: {
      "@": "/src", // Alias untuk import path src
    },
  },

  // === BAGIAN PENTING UNTUK KONFIGURASI PWA MENGGUNAKAN VitePWA ===
  plugins: [
    VitePWA({
      // Tipe pendaftaran Service Worker: 'autoUpdate' akan otomatis memperbarui SW
      registerType: "autoUpdate",

      // Opsi development: Aktifkan PWA di lingkungan development agar bisa diuji
      devOptions: {
        enabled: true,
      },

      // Konfigurasi Web App Manifest
      // VitePWA akan mengambil properti ini dan meng-generate/menggabungkan dengan manifest.json Anda
      manifest: {
        name: "Story Explorer",
        short_name: "StoryEx",
        description:
          "Aplikasi untuk menjelajahi dan berbagi cerita dengan lokasi.",
        start_url: "/", // URL awal saat PWA diluncurkan dari homescreen
        display: "standalone", // Tampilan PWA sebagai aplikasi mandiri (tanpa UI browser)
        background_color: "#ffffff", // Warna latar belakang splash screen
        theme_color: "#004080", // Warna tema aplikasi (misal, untuk toolbar browser)
        icons: [
          // Daftar ikon aplikasi untuk berbagai ukuran
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any", // Ikon dapat digunakan untuk tujuan apa pun
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable", // Ikon yang dapat beradaptasi dengan bentuk maskable OS
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        prefer_related_applications: false, // Tidak menyarankan instalasi aplikasi native
      },

      // === KONFIGURASI WORKBOX DALAM MODE INJECTMANIFEST ===
      // Mode ini mengambil Service Worker kustom Anda (`swSrc`) dan menginjeksikan daftar precache ke dalamnya.
      // INI ADALAH SOLUSI UNTUK ERROR 'swSrc' sebelumnya dan untuk menggunakan service-worker.js kustom Anda.
      injectManifest: {
        swSrc: "service-worker.js", // Path ke Service Worker kustom Anda (relatif terhadap root proyek)
        swDest: "service-worker.js", // Nama file Service Worker yang akan dihasilkan di folder dist

        // Pola file yang akan di-precache oleh Workbox.
        // File-file ini akan ditambahkan ke daftar precache di `service-worker.js` Anda.
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}", // Semua JS, CSS, HTML, gambar umum
          "icons/*.{png,svg,webp,jpg,jpeg}", // Semua ikon di folder 'icons'
        ],
        // Anda bisa menambahkan 'globIgnores' jika ada file di root atau public
        // yang TIDAK ingin diprecache (misalnya, file berukuran sangat besar).
        // Contoh: globIgnores: ['admin/**/*'],
      },

      // === Bagian 'workbox' TIDAK PERLU ADA di sini jika menggunakan 'injectManifest' ===
      // Jika Anda memiliki blok 'workbox: { ... }' dari konfigurasi sebelumnya,
      // pastikan untuk menghapusnya. Menggunakan keduanya dapat menyebabkan konflik.
    }),
  ],
});
