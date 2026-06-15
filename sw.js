// Streak PWA — Service Worker v2
// Android-safe: checks for due reminders on every SW wake

const CACHE = 'streak-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./','./index.html'])));
  self.skipWaiting();
});

self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// ── Reminder storage (in SW memory, refreshed by page messages) ──────────────
let reminders = [];

self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE') {
    reminders = e.data.reminders || [];
    checkDue(); // check immediately in case one is due right now
  }
  if (e.data?.type === 'FIRE_TEST') {
    self.registration.showNotification('🔔 Test notification', {
      body: 'Notifications are working!',
      tag: 'test',
      renotify: true
    });
  }
  if (e.data?.type === 'HEARTBEAT') {
    // Page sends this every minute while open — use it to check reminders
    checkDue();
  }
});

// ── Periodic sync (works on Android Chrome when battery saver allows) ────────
self.addEventListener('periodicsync', e => {
  if (e.tag === 'habit-check') e.waitUntil(checkDue());
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('./');
  }));
});

// ── Check if any reminder is due within the current minute ───────────────────
// We track fired reminders by date so we don't double-fire
const firedToday = {}; // { reminderId: 'YYYY-MM-DD' }

async function checkDue() {
  // If no reminders in memory, ask the page
  if (!reminders.length) {
    const clientList = await clients.matchAll({ type: 'window' });
    clientList.forEach(c => c.postMessage({ type: 'GET_REMINDERS' }));
    return;
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentHH = now.getHours();
  const currentMM = now.getMinutes();
  const dayOfWeek = now.getDay(); // 0=Sun

  for (const r of reminders) {
    if (!r.on) continue;

    // Day filter
    if (r.days === 'weekdays' && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
    if (r.days === 'weekends' && dayOfWeek >= 1 && dayOfWeek <= 5) continue;

    const [rHH, rMM] = r.time.split(':').map(Number);

    // Due if we're within the correct minute
    if (rHH !== currentHH || rMM !== currentMM) continue;

    // Don't fire twice in the same day
    if (firedToday[r.id] === todayStr) continue;

    firedToday[r.id] = todayStr;
    self.registration.showNotification(`⏰ ${r.label}`, {
      body: 'Time to check your habits and keep your streak alive! 🔥',
      tag: r.id,
      renotify: true,
      requireInteraction: false
    });
  }
}
