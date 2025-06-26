// src/api/config.js

// GANTI DENGAN VAPID PUBLIC KEY DARI DICODING API ATAU YANG ANDA GENERATE SENDIRI
// Contoh: const VAPID_PUBLIC_KEY = "BPm_k-c8d45E7l3d...";
// Anda dapat menemukan VAPID public key di dokumentasi API Dicoding
// atau generate sendiri menggunakan web-push library (npm install web-push)
// web-push generate-vapid-keys --json
export const VAPID_PUBLIC_KEY =
  "BP_6y2tYc0YtBSS-q4dDk2d_Wz1p_tQ6BfE0X4QyL4M8J1D0z4n9n2d-Y4K2q_M6g-E8b-C1q_L4C8D8z7X9Q0X4G8H2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z"; // <--- INI SUDAH DIGANTI DENGAN CONTOH KEY!

// Base URL untuk Story API
export const API_BASE_URL = "https://story-api.dicoding.dev/v1";

// Endpoint untuk Push Subscription
export const PUSH_SUBSCRIPTION_API_ENDPOINT = `${API_BASE_URL}/subscriptions`;

// Anda bisa menambahkan konfigurasi lain di sini jika diperlukan
// export const ANOTHER_API_KEY = '...';
