// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/StoryExplorer/", // ✅ Penting untuk GitHub Pages

  plugins: [
    VitePWA({
      registerType: "autoUpdate", // ✅ SW update otomatis
      strategies: "injectManifest", // ✅ Agar kita bisa custom service-worker.js
      srcDir: "src", // ✅ service-worker.js ada di /src
      filename: "service-worker.js", // ✅ nama file akhir di /dist

      injectRegister: "auto", // ✅ Vite akan inject registerSW otomatis di build

      manifest: {
        name: "Story Explorer",
        short_name: "StoryExplorer",
        description: "Aplikasi eksplorasi cerita berbasis lokasi.",
        start_url: "/StoryExplorer/", // ✅ Sesuai base path
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#42a5f5",

        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
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
      },

      devOptions: {
        enabled: true, // ✅ PWA aktif saat npm run dev
        type: "module", // ✅ Gunakan registerSW berbasis ES Module
      },
    }),
  ],
});
