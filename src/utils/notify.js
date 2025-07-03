// utils/notify.js
export function showNotification(title, options = {}) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}
