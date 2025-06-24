// src/api/config.js

// GANTI DENGAN VAPID PUBLIC KEY DARI DICODING API ATAU YANG ANDA GENERATE SENDIRI
// Contoh: const VAPID_PUBLIC_KEY = "BPm_k-c8d45E7l3d...";
// Anda dapat menemukan VAPID public key di dokumentasi API Dicoding
// atau generate sendiri menggunakan web-push library (npm install web-push)
// web-push generate-vapid-keys --json
export const VAPID_PUBLIC_KEY =
  "YOUR_VAPID_PUBLIC_KEY_FROM_DICODING_API_OR_YOURS"; // <--- GANTI INI!

// Base URL untuk Story API
export const API_BASE_URL = "https://story-api.dicoding.dev/v1";

// Endpoint untuk Push Subscription
export const PUSH_SUBSCRIPTION_API_ENDPOINT = `${API_BASE_URL}/subscriptions`;

// Anda bisa menambahkan konfigurasi lain di sini jika diperlukan
// export const ANOTHER_API_KEY = '...';
