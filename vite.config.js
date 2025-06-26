// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // ✅ GANTI base path untuk GitHub Pages!
  base: "/StoryExplorer/",

  server: {
    port: 3000,
    open: true,
    host: true,
  },

  build: {
    outDir: "docs", // ✅ Sesuaikan agar hasil build langsung ke docs/
    sourcemap: true,
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Story Explorer",
        short_name: "StoryEx",
        description:
          "Aplikasi untuk menjelajahi dan berbagi cerita dengan lokasi.",
        start_url: "/StoryExplorer/", // ✅ pastikan sesuai base path
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#004080",
        icons: [
          {
            src: "/StoryExplorer/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/StoryExplorer/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/StoryExplorer/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/StoryExplorer/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        prefer_related_applications: false,
      },

      injectManifest: {
        swSrc: "service-worker.js",
        swDest: "service-worker.js",
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}",
          "icons/*.{png,svg,webp,jpg,jpeg}",
        ],
      },
    }),
  ],
});
