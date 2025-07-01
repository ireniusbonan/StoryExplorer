// vite.config.js (Fokus pada bagian 'manifest' dan 'base')
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/StoryExplorer/", // TETAPKAN INI UNTUK GITHUB PAGES

  // ... konfigurasi server dan build ...

  plugins: [
    VitePWA({
      // ... registerType, devOptions ...
      manifest: {
        // ... name, short_name, description, display, background_color, theme_color ...
        start_url: "/", // KRITIS: UBAH INI JADI HANYA '/'
        icons: [
          {
            src: "/icons/icon-192x192.png", // KRITIS: HAPUS '/StoryExplorer/' dari awal path
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png", // KRITIS: HAPUS '/StoryExplorer/'
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-144x144.png", // KRITIS: HAPUS '/StoryExplorer/' (dan pastikan file ada)
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-192x192.png", // KRITIS: HAPUS '/StoryExplorer/'
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512x512.png", // KRITIS: HAPUS '/StoryExplorer/'
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        prefer_related_applications: false,
      },
      // ... injectManifest configuration ...
      injectManifest: {
        swSrc: "service-worker.js",
        swDest: "service-worker.js",
        // Glob patterns biasanya sudah relatif ke root output (docs/), jadi tidak perlu perubahan di sini
        // Namun, karena start_url dan src icon di manifest akan jadi '/', mungkin perlu pastikan
        // Workbox masih bisa menemukan aset dengan konfigurasi ini.
        // Jika masih ada masalah, bisa coba ubah globPatterns untuk mencocokkan path yang di-deploy (contoh di bawah)
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}",
          "icons/*.{png,svg,webp,jpg,jpeg}",
          // Jika aset Anda di-deploy di subfolder /StoryExplorer/docs, Anda mungkin perlu:
          // 'StoryExplorer/docs/**/*.{js,css,html}',
          // 'StoryExplorer/docs/icons/*.{png,svg,webp,jpg,jpeg}',
          // NAMUN, ini biasanya sudah ditangani Workbox dengan baik.
          // Jadi, fokus utama adalah path src icon di manifest dan start_url.
        ],
      },
    }),
  ],
});
