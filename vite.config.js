// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // ... konfigurasi lainnya ...
  base: "/", // Biasanya ini sudah default. Biarkan saja untuk root domain.
  // Jika Anda deploy ke subfolder (misal Netlify site preview / branch),
  // baru Anda mungkin perlu base: '/nama-subfolder/'
  plugins: [
    VitePWA({
      // ... konfigurasi PWA lainnya ...
      workbox: {
        // Pastikan swDest adalah nama file di root folder build Anda
        swDest: "service-worker.js", // Ini adalah path relatif terhadap outDir (dist)
        // ... konfigurasi workbox lainnya ...
      },
    }),
  ],
});
