const AUTH_API_BASE = "https://story-api.dicoding.dev/v1";

export default class AuthModel {
  async login({ email, password }) {
    const response = await fetch(`${AUTH_API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login gagal");
    if (data.loginResult && data.loginResult.token) {
      localStorage.setItem("token", data.loginResult.token);
    }
    return data;
  }

  async register({ name, email, password }) {
    const response = await fetch(`${AUTH_API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Register gagal");
    return data;
  }

  async logout() {
    localStorage.removeItem("token");
    // Anda mungkin ingin menambahkan logika untuk meng-unsubscribe dari push notification di sini
    // if (navigator.serviceWorker && 'PushManager' in window) {
    //   const registration = await navigator.serviceWorker.ready;
    //   const subscription = await registration.pushManager.getSubscription();
    //   if (subscription) {
    //     await subscription.unsubscribe();
    //     // Kirim ke backend untuk menghapus subscription dari database server
    //     // Contoh: await fetch('/api/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint: subscription.endpoint }), headers: { 'Content-Type': 'application/json' } });
    //   }
    // }
  }

  isLoggedIn() {
    return !!localStorage.getItem("token");
  }
}
