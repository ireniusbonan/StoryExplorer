// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/StoryExplorer/", // Ganti sesuai subfolder GitHub Pages jika perlu
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest", // Agar kamu bisa kontrol isi service-worker.js manual
      srcDir: "src", // Folder tempat SW berada
      filename: "service-worker.js", // File service worker kamu
      injectRegister: "auto", // Otomatis daftarkan SW di index.html
      manifest: {
        name: "Story Explorer",
        short_name: "StoryApp",
        description: "Aplikasi eksplorasi cerita berbasis lokasi",
        start_url: "/StoryExplorer/", // HARUS sesuaikan dengan base
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42a5f5",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        prefer_related_applications: false,
      },
      devOptions: {
        enabled: true, // Aktifkan PWA saat `vite` dijalankan (dev mode)
        type: "module",
      },
    }),
  ],
});
