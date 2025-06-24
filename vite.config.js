// vite.config.js
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/StoryExplorer/", // ← HARUS ADA!
  plugins: [VitePWA()],
});
