import { defineConfig } from "vite";

export default defineConfig({
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
});
