// Streak PWA — Service Worker
// This file does NOT need to change between app versions.
// Auto-update is handled by APP_VERSION in index.html.

const CACHE = 'streak-cache-v1';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/streak/', '/streak/index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'SCHEDULE') {
    reminders = e.data.reminders || [];
    checkDue();
  }
  if (e.data?.type === 'HEARTBEAT') checkDue();
  if (e.data?.type === 'FIRE_TEST') {
    self.registration.showNotification('🔔 Test notification', {
      body: 'Notifications are working!', tag: 'test', renotify: true
    });
  }
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'habit-check') e.waitUntil(checkDue());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('/streak/');
  }));
});

let reminders = [];
const firedToday = {};

async function checkDue() {
  if (!reminders.length) {
    const list = await clients.matchAll({ type: 'window' });
    list.forEach(c => c.postMessage({ type: 'GET_REMINDERS' }));
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const hh = now.getHours();
  const mm = now.getMinutes();
  const dow = now.getDay();

  for (const r of reminders) {
    if (r.days === 'weekdays' && (dow === 0 || dow === 6)) continue;
    if (r.days === 'weekends' && dow >= 1 && dow <= 5) continue;

    const [rh, rm] = r.time.split(':').map(Number);
    if (rh !== hh || rm !== mm) continue;

    if (firedToday[r.id] === todayStr) continue;
    firedToday[r.id] = todayStr;

    self.registration.showNotification(`${r.icon} ${r.label}`, {
      body: 'Time to log your habit and keep your streak alive! 🔥',
      tag: r.id,
      renotify: true,
      requireInteraction: false
    });
  }
}
